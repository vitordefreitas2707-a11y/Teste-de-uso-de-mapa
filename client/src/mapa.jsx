import "leaflet/dist/leaflet.css";
import { useEffect, useState, useRef } from "react";
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
  const [temp, setTemp] = useState([]);
  // Usa useRef para evitar requisição quando uma sugestão é selecionada (síncrono).
  const skipNextFetchRef = useRef(false);

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

    // Se uma sugestão foi selecionada, pula a requisição.
    if (skipNextFetchRef.current) {
      skipNextFetchRef.current = false;
      return;
    }

    // Se o usuário digitou menos de 3 caracteres, não vale a pena buscar sugestões.
    if (termo.length < 3) {
      // Limpa as sugestões antigas para não mostrar resultado fora de contexto.
      setSuggestions([]);
      // Garante que o texto de carregamento fique desligado.
      setLoadingSuggestions(false);
      // Encerra o efeito porque ainda não há texto suficiente.
      return undefined;
    }

    // Cria um AbortController para cancelar requisições anteriores se necessário.
    const abortController = new AbortController();

    // Aguarda 350ms para evitar chamar a API a cada tecla digitada.
    const timeoutId = window.setTimeout(async () => {
      // Ativa o indicador de carregamento enquanto a requisição acontece.
      setLoadingSuggestions(true);

      try {
        // Faz a requisição para o backend que conversa com o Google Places.
        const response = await fetch(
          `http://localhost:3001/api/google/maps/autocomplete?input=${encodeURIComponent(termo)}`,
          { signal: abortController.signal }
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
        // Ignora erros de abort (quando a requisição foi cancelada intencionalmente).
        if (err.name === "AbortError") {
          return;
        }
        // Mostra no console qualquer falha de rede ou de API.
        console.error("Erro ao buscar autocomplete:", err);
        // Limpa as sugestões caso a requisição falhe.
        setSuggestions([]);
      } finally {
        // Desliga o indicador de carregamento no fim da requisição.
        setLoadingSuggestions(false);
      }
    }, 350);

    // Cleanup: cancela a requisição e limpa o timeout quando o endereço muda de novo.
    return () => {
      window.clearTimeout(timeoutId);
      abortController.abort();
    };
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
    // Marca para pular a próxima requisição à API.
    skipNextFetchRef.current = true;
    setAddress(sugestao.description);
    setLat(sugestao.latitude); 
    setLong(sugestao.longitude);
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

    try {
      const res = await fetch("http://localhost:3001/bd/marcadores");
      if (!res.ok) throw new Error('fetch-failed');
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('bad-data');
      // servidor ok — prosseguir normalmente
    } catch (err) {
      alert("Banco de dados não encontrado, salvando localmente");
      setMarkers(prev => [...prev, {
        id: Date.now(),
        endereco: address,
        descricao: desc,
        latitude: parseFloat(lat),
        longitude: parseFloat(long)
      }]);
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
    setMarkers((prev) => [...prev, novo]);

    // Limpa os campos depois de salvar.
    setLat("");
    setLong("");
    setAddress("");
    setDesc("");
    setSuggestions([]);
    setLoadingSuggestions(false);
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

      <p>Endereço</p>
      <input
        type="text"
        value={address}
        id="endereco"
        onChange={(e) => {
          // Reseta o flag para permitir novas requisições quando o usuário digita.
          skipNextFetchRef.current = false;
          // Atualiza o endereço conforme o usuário digita.
          setAddress(e.target.value);
          // Limpa a latitude antiga porque o texto novo pode mudar a sugestão escolhida.
          setLat("");
          // Limpa a longitude antiga porque o texto novo pode mudar a sugestão escolhida.
          setLong("");
        }}
        placeholder="Digite o endereço"
      />

      {loadingSuggestions ? <p>Buscando sugestões...</p> : null}

      {suggestions.length > 0 ? (
        <ul>
          {suggestions.map((sugestao) => (
            <li key={sugestao.place_id}>
              <button type="button" onClick={() => selecionarSugestao(sugestao)}>
                {sugestao.description}
              </button>
              <span>
                {sugestao.latitude != null && sugestao.longitude != null
                  ? ` (${sugestao.latitude}, ${sugestao.longitude})`
                  : ""}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      <br />
      <p>descrição</p>
      <input type="text" value={desc} onChange={(e) => setDesc(e.target.value)} />
      <br />
      <button onClick={adicionarMarcador}>Adicionar Marcador</button>
    </div>
  );
}

export default Mapa;