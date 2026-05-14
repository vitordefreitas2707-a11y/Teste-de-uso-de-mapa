export const reverseGeocodeGetAddress = async (req, res) => {
  const latRaw = req.query.lat ?? req.query.latitude;
  const lngRaw = req.query.lng ?? req.query.long ?? req.query.longitude;
  const lat = parseFloat(latRaw);
  const lng = parseFloat(lngRaw);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return res.status(400).json({ error: "Parametros invalidos: forneca lat e lng como numeros" });
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(400).json({ error: "Valores de latitude/longitude fora do intervalo" });
  }

  const key = process.env.GOOGLE_API_KEY;
  if (!key) {
    return res.status(500).json({ error: "Chave de API do Google nao configurada no servidor" });
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data?.status === "OK" && Array.isArray(data.results) && data.results.length > 0) {
      const address = data.results[0].formatted_address;
      
      // Valida se o endereço não está vazio
      if (!address || address.trim() === "") {
        return res.status(502).json({ error: "Endereço vazio retornado pela API", raw: data });
      }
      
      return res.json({
        success: true,
        latitude: lat,
        longitude: lng,
        address: address,
        raw: data,
      });
    }

    return res.status(502).json({ error: data?.status || "Erro no geocoding", raw: data });
  } catch (err) {
    return res.status(500).json({ error: err?.message || "Falha ao chamar API externa" });
  }
};

export const MapsAutocompleteGetAddress = async (req, res) => {
  const endereco = req.query.endereco || req.query.address || req.query.input;
  const key = process.env.GOOGLE_API_KEY;

  if (!endereco || typeof endereco !== "string") {
    return res.status(400).json({ error: "Parametro 'endereco' (ou 'input') é obrigatório e deve ser uma string" });
  }

  if (!key) {
    return res.status(500).json({ error: "Chave de API do Google nao configurada no servidor" });
  }

  const sessiontoken = req.query.sessiontoken;
  const language = req.query.language || "pt-BR";
  const components = req.query.components || "country:br";
  const types = req.query.types;

  const params = new URLSearchParams({
    input: endereco.trim(),
    key,
    language,
    components,
  });

  if (sessiontoken) {
    params.set("sessiontoken", String(sessiontoken));
  }

  if (types) {
    params.set("types", String(types));
  }

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data?.status === "OK" || data?.status === "ZERO_RESULTS") {
      const predictions = Array.isArray(data.predictions) ? data.predictions : [];
      const predictionsComCoordenadas = await Promise.all(
        predictions.map(async (prediction) => {
          let latitude = null;
          let longitude = null;

          if (prediction?.place_id) {
            const detailsParams = new URLSearchParams({
              place_id: prediction.place_id,
              key,
              fields: "geometry",
            });

            if (language) {
              detailsParams.set("language", language);
            }

            const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?${detailsParams.toString()}`;

            try {
              const detailsResponse = await fetch(detailsUrl);
              const detailsData = await detailsResponse.json();
              const location = detailsData?.result?.geometry?.location;

              if (detailsData?.status === "OK" && location) {
                latitude = location.lat ?? null;
                longitude = location.lng ?? null;
              }
            } catch {
              latitude = null;
              longitude = null;
            }
          }

          return {
            description: prediction.description,
            place_id: prediction.place_id,
            structured_formatting: prediction.structured_formatting,
            types: prediction.types,
            matched_substrings: prediction.matched_substrings,
            terms: prediction.terms,
            latitude,
            longitude,
          };
        })
      );

      return res.json({
        success: true,
        input: endereco.trim(),
        predictions: predictionsComCoordenadas,
        raw: data,
      });
    }

    return res.status(502).json({ error: data?.status || "Erro no autocomplete", raw: data });
  } catch (err) {
    return res.status(500).json({ error: err?.message || "Falha ao chamar API externa" });
  }
}