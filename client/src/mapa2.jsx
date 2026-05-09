import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

function Mapa2() {
  const [lat, setLat] = useState("");
  const [long, setLong] = useState("");
  const [desc, setDesc] = useState("");
  const [address, setAddress] = useState("");
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    // Carrega do banco os marcadores ja salvos quando a tela abre.
    fetch("http://localhost:3001/bd/marcadores")
      .then((res) => res.json())
      .then((data) => setMarkers(data));
  }, []);

  const reverseGeocode = async () => {
    //verifica se latitude são valores validos localmente antes de fazer as verificações no servidor
    if (!lat || !long || isNaN(lat) || isNaN(long)) {
      alert("Latitude e longitude inválidas");
      return false;
    }

    try {
      //tenta chamar a api
      const response = await fetch(
        `http://localhost:3001/api/google/maps/reverse-geocode?lat=${lat}&lng=${long}`
      );
      
      //caso a resposta do try seja um erro ele mostra o codigo de erro devolvido em um alert com uma mensagem daora
      if (!response.ok) {
        const error = await response.json();
        console.error("Erro do geocoding:", error);
        alert(error.error || "Erro ao obter endereço");
        return false;
      }

      //coloca dentro de data a resposta da api
      const data = await response.json();
      //caso a api falar que deu o endereço certo e o adress exista ela coloca o adress localmente e retorna true para o marcador ser colocado
      if (data.success && data.address) {
        setAddress(data.address);
        return true;
      } else {
        //caso a api falar que deu errado ou nao me devolver um endereço da erro e impede na constante adicionar o marcador de ser adicionado
        alert("Não foi possível obter o endereço");
        return false;
      }
    } catch (err) {
      console.error("Falha na requisição:", err);
      alert("Erro ao chamar API de geocoding");
      return false;
    }
  };

  //metodo que usei para chamar os dois metodos de uma vez sem 
  const adicionar = async () => {
    //esse addressOK é uma variavel do reverseGeocode que confirma se o endereço foi entreque eu confirmei como true la atras
    const addressOk = await reverseGeocode();
    if (addressOk) {
      adicionarMarcador();
    }
  };

  //constante para adicionar o marcador no banco e no mapa do leaflet
  const adicionarMarcador = async () => {
    //verifica se lat e longitude são valores validos
    if (!lat || !long || isNaN(lat) || isNaN(long)) {
      console.error("Valores de latitude e longitude inválidos");
      return;
    }else{
      
      
      
      const response = await fetch("http://localhost:3001/bd/marcadores", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      //ele inicialemente manda para o banco os valores como um vetor json
      body: JSON.stringify({
        endereco: address,
        descricao: desc,
        latitude: parseFloat(lat),
        longitude: parseFloat(long),
      }),
    });

    // se o marcador foi criado ele devolve aquele vetor json la de traz para adicionar localmente
    const novo = await response.json();
    setMarkers([...markers, novo]);

    setLat("");
    setLong("");
    setAddress("");
    setDesc("");
 } 
};

  //pega o id do marcador aberto e manda esse id la pro backend para deletar o marcador certo
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
              <strong>{m.endereco}</strong>
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
      <input value={lat} onChange={(e) => setLat(parseFloat(e.target.value))} />
      <br />
      Longitude
      <br />
      <input value={long} onChange={(e) => setLong(parseFloat(e.target.value))} />
      <br />
      Descrição
      <br />
      <input value={desc} onChange={(e) => setDesc(e.target.value)} />
      <br />
      <br />
      <button onClick={adicionar}>Adicionar</button>
    </div>
  );
}

export default Mapa2;