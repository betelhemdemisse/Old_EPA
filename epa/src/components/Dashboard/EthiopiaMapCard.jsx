// components/Dashboard/EthiopiaMapCard.jsx
import React, { useState } from "react";
import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';

// Dummy data for EPA locations across Ethiopia
const epaLocations = [
  {
    id: 1,
    name: "EPA Main Headquarters",
    address: "Around Arat Kilo behind Abrehot Library, Beside Ministry of Industry, Arada Sub City Wereda 09, Addis Ababa",
    phone: "+251 (0)11-170-4038 / +251 (0)11-170-4150",
    fax: "+251 (0)11-170-4158 / 45",
    pobox: "P.O.BOX 12760",
    coordinates: { lat: 9.0227, lng: 38.7469 }, // Addis Ababa coordinates
    type: "Headquarters"
  },
  {
    id: 2,
    name: "EPA Oromia Regional Office",
    address: "Megenagna, Finfinne, Oromia Region",
    phone: "+251 (0)11-553-2011",
    fax: "+251 (0)11-553-2012",
    pobox: "P.O.BOX 5678",
    coordinates: { lat: 8.9806, lng: 38.7578 },
    type: "Regional Office"
  },
  {
    id: 3,
    name: "EPA Amhara Regional Office",
    address: "Near Goha Hotel, Bahir Dar, Amhara Region",
    phone: "+251 (0)58-220-3040",
    fax: "+251 (0)58-220-3041",
    pobox: "P.O.BOX 1234",
    coordinates: { lat: 11.5742, lng: 37.3614 },
    type: "Regional Office"
  },
  {
    id: 4,
    name: "EPA SNNPR Regional Office",
    address: "Tabor Area, Hawassa, Sidama Region",
    phone: "+251 (0)46-221-0890",
    fax: "+251 (0)46-221-0891",
    pobox: "P.O.BOX 3456",
    coordinates: { lat: 7.0470, lng: 38.4660 },
    type: "Regional Office"
  },
  {
    id: 5,
    name: "EPA Tigray Regional Office",
    address: "Adi Haki, Mekelle, Tigray Region",
    phone: "+251 (0)34-441-6565",
    fax: "+251 (0)34-441-6566",
    pobox: "P.O.BOX 7890",
    coordinates: { lat: 13.4965, lng: 39.4769 },
    type: "Regional Office"
  },
  {
    id: 6,
    name: "EPA Dire Dawa Branch Office",
    address: "Kezira, Dire Dawa City Administration",
    phone: "+251 (0)25-111-2233",
    fax: "+251 (0)25-111-2234",
    pobox: "P.O.BOX 1122",
    coordinates: { lat: 9.5931, lng: 41.8661 },
    type: "Branch Office"
  }
];

// Main Component - You must replace 'YOUR_GOOGLE_MAPS_API_KEY' with your actual key.
export default function EthiopiaMapCard() {
  const [activeLocation, setActiveLocation] = useState(null);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">EPA Contact Locations</h2>
        <span className="text-sm text-gray-500">Click a pin for details</span>
      </div>

      {/* Google Map Container */}
      <div className="h-96 rounded-xl border border-gray-300 overflow-hidden mb-6">
        <APIProvider apiKey={'YOUR_GOOGLE_MAPS_API_KEY'}>
          <Map
            defaultZoom={6}
            defaultCenter={{ lat: 9.0, lng: 38.7 }} // Centered on Ethiopia
            mapId={'DEMO_MAP_ID'} // Optional: for cloud-based map styling
            gestureHandling={'greedy'}
          >
            {/* Render Markers for each location */}
            {epaLocations.map((location) => (
              <AdvancedMarker
                key={location.id}
                position={location.coordinates}
                onClick={() => setActiveLocation(location)}
              >
                {/* Custom pin appearance */}
                <div className={`w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${activeLocation?.id === location.id ? 'bg-red-600' : 'bg-blue-600'}`}>
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </AdvancedMarker>
            ))}

            {/* Info Window (Tooltip) for the active location */}
            {activeLocation && (
              <InfoWindow
                position={activeLocation.coordinates}
                onCloseClick={() => setActiveLocation(null)}
              >
                <div className="p-2 min-w-64">
                  <button
                    onClick={() => setActiveLocation(null)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
                    aria-label="Close tooltip"
                  >
                    ✕
                  </button>
                  <h3 className="font-bold text-gray-800 text-lg mb-2">{activeLocation.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Type:</span> {activeLocation.type}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Address:</span> {activeLocation.address}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Phone:</span> {activeLocation.phone}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Fax:</span> {activeLocation.fax}
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    <span className="font-semibold">P.O. Box:</span> {activeLocation.pobox}
                  </p>
                  <a
                    href={`tel:${activeLocation.phone.replace(/\D+/g, '')}`}
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    Call {activeLocation.phone.split('/')[0].trim()}
                  </a>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      </div>

      
    </div>
  );
}