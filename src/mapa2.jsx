import { useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import './mapa2.css';

function Mapa2() {
  const [lat, setLat] = useState('');
  const [long, setLong] = useState('');
  const [desc, setDesc] = useState('');
  const [nome, setNome] = useState('');
  const [markers, setMarkers] = useState([]);
  const [markId, setMarkId] = useState(0);

  // ➕ adicionar marcador (SÓ NO FRONTEND)
  const adicionarMarcador = () => {
    if (!lat || !long) return;

    const novoMarcador = {
      id: markId,
      lat: parseFloat(lat),
      long: parseFloat(long),
      nome: nome || "Sem nome",
      desc: desc || "Sem descrição"
    };

    setMarkers([...markers, novoMarcador]);

    // limpar campos
    setLat('');
    setLong('');
    setNome('');
    setDesc('');
    setMarkId(markId + 1);
  };

  // 🗑️ deletar marcador (SÓ NO FRONTEND)
  const deletarMarcador = (id) => {
    setMarkers(markers.filter((m) => m.id !== id));
  };

  return (
    <div>
      <MapContainer
        center={[-23.55, -46.63]}
        zoom={10}
        style={{ height: '70vh' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {markers.map((m) => (
          <Marker key={m.id} position={[m.lat, m.long]}>
            <Popup>
              <strong>{m.nome}</strong><br />
              {m.desc}
              <br />
              <button onClick={() => deletarMarcador(m.id)}>
                Deletar
              </button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* INPUTS */}
      <input
        type="text"
        value={lat}
        placeholder="latitude"
        onChange={(e) => setLat(e.target.value)}
      />
      <br />

      <input
        type="text"
        value={long}
        placeholder="longitude"
        onChange={(e) => setLong(e.target.value)}
      />
      <br />

      <input
        type="text"
        value={nome}
        placeholder="nome"
        onChange={(e) => setNome(e.target.value)}
      />
      <br />

      <input
        type="text"
        value={desc}
        placeholder="descrição"
        onChange={(e) => setDesc(e.target.value)}
      />
      <br />

      <button onClick={adicionarMarcador}>
        Adicionar marcador
      </button>
    </div>
  );
}

export default Mapa2;