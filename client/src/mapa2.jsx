import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

function Mapa2() {
  const [lat, setLat] = useState("");
  const [long, setLong] = useState("");
  const [desc, setDesc] = useState("");
  const [nome, setNome] = useState("");
  const [address, setAddress] = useState("");
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    // Carrega do banco os marcadores ja salvos quando a tela abre.
    fetch("http://localhost:3001/marcadores")
      .then((res) => res.json())
      .then((data) => setMarkers(data));
  }, []);

    const reverseGeocode = async () => {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${process.env.GOOGLE_API_KEY}`;
      
      try {
        const response = await fetch(url);
        const data = await response.json();
    
        if (data.status === "OK") {
          setAddress(data.results[0].formatted_address);
          console.log("Endereço:", address);
          return address;
        } else {
          console.error("Erro:", data.status);
        }
      } catch (error) {
        console.error("Falha na requisição:", error);
      }
    }

  const adicionarMarcador = async () => {
    if (!lat || !long) return;

    const response = await fetch("http://localhost:3001/marcadores", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nome,
        descricao: desc,
        latitude: parseFloat(lat),
        longitude: parseFloat(long),
      }),
    });

    // Se o backend criou com sucesso, o novo marcador entra no estado local.
    const novo = await response.json();
    setMarkers([...markers, novo]);

    setLat("");
    setLong("");
    setNome("");
    setDesc("");
  };

  const deletarMarcador = async (id) => {
    const response = await fetch(`http://localhost:3001/marcadores/${id}`, {
      method: "DELETE",
    });

    // So remove da tela quando o backend confirmar que apagou no banco.
    if (!response.ok) {
      const mensagem = await response.text();
      alert(mensagem || "Nao foi possivel deletar o marcador");
      return;
    }

    setMarkers((estadoAnterior) =>
      estadoAnterior.filter((m) => Number(m.id) !== Number(id))
    );
  };

  return (
    <div>
      <MapContainer center={[-23.55, -46.63]} zoom={10} style={{ height: "60vh" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {markers.map((m) => (
          <Marker key={m.id} position={[m.latitude, m.longitude]}>
            <Popup>
              <strong>{m.nome}</strong>
              <br />
              {m.descricao}
              <br />
              <button onClick={() => deletarMarcador(m.id)}>Deletar</button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      Latitude
      <br />
      <input value={lat} onChange={(e) => setLat(e.target.value)} />
      <br />
      Longitude
      <br />
      <input value={long} onChange={(e) => setLong(e.target.value)} />
      <br />
      Nome
      <br />
      <input value={nome} onChange={(e) => setNome(e.target.value)} />
      <br />
      Descrição
      <br />
      <input value={desc} onChange={(e) => setDesc(e.target.value)} />
      <br />
      <input value={address} type="text" readOnly />
      <br />
      <button onClick={() => {adicionarMarcador(), reverseGeocode(lat, long)}}>Adicionar</button>
    </div>
  );
}

export default Mapa2;