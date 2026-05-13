import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

function Mapa() {
  const [markers, setMarkers] = useState([]);
  const [lat, setLat] = useState("");
  const [long, setLong] = useState("");
  const [desc, setDesc] = useState("");
  const [address, setAddress] = useState("");
  // Guarda as sugestões que vêm da API de autocomplete.
  const [suggestions, setSuggestions] = useState([]);
  // Controla quando a busca de sugestões ainda está carregando.
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    // Carrega do banco os marcadores ja salvos quando a tela abre.
    fetch("http://localhost:3001/bd/marcadores")
      .then((res) => res.json())
      .then((data) => setMarkers(data))
      .catch((err) => {
        console.error("Erro ao carregar marcadores:", err);
      });
  }, []);

  useEffect(() => {
    // Remove espaços extras do texto digitado antes de consultar a API.
    const termo = address.trim();

    // Se o usuário digitou menos de 3 caracteres, não vale a pena buscar sugestões.
    if (termo.length < 3) {
      // Limpa as sugestões antigas para não mostrar resultado fora de contexto.
      setSuggestions([]);
      // Garante que o texto de carregamento fique desligado.
      setLoadingSuggestions(false);
      // Encerra o efeito porque ainda não há texto suficiente.
      return undefined;
    }

    // Aguarda 350ms para evitar chamar a API a cada tecla digitada.
    const timeoutId = window.setTimeout(async () => {
      // Ativa o indicador de carregamento enquanto a requisição acontece.
      setLoadingSuggestions(true);

      try {
        // Faz a requisição para o backend que conversa com o Google Places.
        const response = await fetch(
          `http://localhost:3001/api/google/maps/autocomplete?input=${encodeURIComponent(termo)}`
        );

        // Se o backend respondeu com erro, limpa a lista e para aqui.
        if (!response.ok) {
          setSuggestions([]);
          return;
        }

        // Converte a resposta para JSON.
        const data = await response.json();
        // Salva no estado apenas o array de sugestões, ou vazio se vier algo inválido.
        setSuggestions(Array.isArray(data.predictions) ? data.predictions : []);
      } catch (err) {
        // Mostra no console qualquer falha de rede ou de API.
        console.error("Erro ao buscar autocomplete:", err);
        // Limpa as sugestões caso a requisição falhe.
        setSuggestions([]);
      } finally {
        // Desliga o indicador de carregamento no fim da requisição.
        setLoadingSuggestions(false);
      }
    }, 350);

    // Limpa o timeout anterior quando o endereço muda de novo.
    return () => window.clearTimeout(timeoutId);
  }, [address]);

  const deletarMarcador = async (id) => {
    const response = await fetch(`http://localhost:3001/bd/marcadores/${id}`, {
      method: "DELETE",
    });

    // verifique se o banco de dados permitiu o delete caso nao devolve o erro como um alert.
    if (!response.ok) {
      const mensagem = await response.text();
      alert(mensagem || "Nao foi possivel deletar o marcador");
      return;
    }
    //apaga o marcador localemente
    setMarkers((estadoAnterior) =>
      estadoAnterior.filter((marcador) => Number(marcador.id) !== Number(id))
    );
  };

  const selecionarSugestao = (sugestao) => {
    // Preenche o campo de endereço com a sugestão escolhida.
    setAddress(sugestao.description);
    // Copia a latitude retornada pela API para o estado.
    setLat(sugestao.latitude); 
    alert(lat);
    // Copia a longitude retornada pela API para o estado.
    setLong(sugestao.longitude);
    // Fecha a lista de sugestões depois da escolha.
    if(!lat || !long || Number.isNaN(Number(lat)) || Number.isNaN(Number(long))){
      alert("essa porra ta errada");
    }else{
      adicionarMarcador
    }
    setSuggestions([]);
  };

  const adicionarMarcador = async () => {
    // Impede salvar sem endereço preenchido.
    if (!address.trim()) {
      alert("Informe um endereço");
      return;
    }

    // Impede salvar se latitude ou longitude não estiverem válidas.
    if (!lat || !long || Number.isNaN(Number(lat)) || Number.isNaN(Number(long))) {
      alert("Selecione uma sugestão válida para preencher latitude e longitude");
      return;
    }

    // Envia o novo marcador para o backend.
    const response = await fetch("http://localhost:3001/bd/marcadores", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Converte os dados do formulário em JSON para salvar no banco.
      body: JSON.stringify({
        endereco: address,
        descricao: desc,
        latitude: parseFloat(lat),
        longitude: parseFloat(long),
      }),
    });

    // Lê o marcador criado que o backend devolveu.
    const novo = await response.json();
    // Atualiza a lista na tela sem precisar recarregar a página.
    setMarkers((estadoAnterior) => [...estadoAnterior, novo]);

    // Limpa os campos depois de salvar.
    setLat("");
    // Limpa os campos depois de salvar.
    setLong("");
    // Limpa os campos depois de salvar.
    setAddress("");
    // Limpa os campos depois de salvar.
    setDesc("");
    // Fecha qualquer sugestão restante.
    setSuggestions([]);
    adicionarMarcador
  };

  return (
    <div>
      <MapContainer center={[-23.55, -46.63]} zoom={10} style={{ height: "60vh", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {Array.isArray(markers) && markers.map((m) => (
          <Marker key={m.id} position={[m.latitude, m.longitude]}>
            <Popup>
              <strong>{m.endereco}</strong>
              <br />
              {m.descricao}
              <br />
              <button onClick={() => deletarMarcador(m.id)}>Deletar</button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <h1>Endereço</h1>
      <input
        type="text"
        value={address}
        onChange={(e) => {
          // Atualiza o endereço conforme o usuário digita.
          setAddress(e.target.value);
          // Limpa a latitude antiga porque o texto novo pode mudar a sugestão escolhida.
          setLat("");
          // Limpa a longitude antiga porque o texto novo pode mudar a sugestão escolhida.
          setLong("");
        }}
        placeholder="Digite o endereço"
      />

      {/* Mostra uma mensagem enquanto a busca de sugestões está acontecendo. */}
      {loadingSuggestions ? <p>Buscando sugestões...</p> : null}

      {/* Exibe a lista de sugestões quando houver resultados. */}
      {suggestions.length > 0 ? (
        <ul>
          {suggestions.map((sugestao) => (
            <li key={sugestao.place_id}>
              {/* Ao clicar, preenche o endereço e as coordenadas dessa sugestão. */}
              <button type="button" onClick={() => selecionarSugestao(sugestao)}>
                {sugestao.description}
              </button>
              {/* Mostra as coordenadas quando vierem da API. */}
              <span>
                {sugestao.latitude != null && sugestao.longitude != null
                  ? ` (${sugestao.latitude}, ${sugestao.longitude})`
                  : ""}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <h1>Descrição</h1>
      <input type="text" value={desc} onChange={(e) => setDesc(e.target.value)} />

      <h1>Latitude</h1>
      <input type="text" value={lat} onChange={(e) => setLat(e.target.value)} />

      <h1>Longitude</h1>
      <input type="text" value={long} onChange={(e) => setLong(e.target.value)} />

      <br />
      <button onClick={adicionarMarcador}>Adicionar Marcador</button>
    </div>
  );
}

export default Mapa;