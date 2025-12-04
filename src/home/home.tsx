import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Search, Trash2, X, LogOut } from 'lucide-react';
import api from "@/api/axios"
// Mock API functions - replace with actual axios calls


interface GeoData {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  loc?: string;
  org?: string;
  timezone?: string;
}

interface SearchHistory {
  id: number;
  ip_address: string;
  city?: string;
  region?: string;
  country?: string;
  latitude?: string;
  longitude?: string;
  timezone?: string;
  searched_at: string;
}

export default function Home() {
  const [currentGeoData, setCurrentGeoData] = useState<GeoData | null>(null);
  const [searchIP, setSearchIP] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<Set<number>>(new Set());
  const [userIP, setUserIP] = useState('');

  useEffect(() => {
    loadUserGeoData();
    loadHistory();
  }, []);

  const loadUserGeoData = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://ipinfo.io/json');
      const data = await response.json();
      setCurrentGeoData(data);
      setUserIP(data.ip);
      setError('');
    } catch (err) {
      setError('Failed to load your geolocation data');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await api.get('/history');
      setHistory(response.data.history || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const validateIP = (ip: string): boolean => {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipv4Regex.test(ip);
  };

  const handleSearch = async () => {
    setError('');
    
    if (!searchIP.trim()) {
      setError('Please enter an IP address');
      return;
    }

    if (!validateIP(searchIP)) {
      setError('Invalid IP address format. Please enter a valid IPv4 address.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://ipinfo.io/${searchIP}/json`);
      const data = await response.json();
      
      if (data.error || data.bogon) {
        setError('Unable to find geolocation data for this IP address');
        setLoading(false);
        return;
      }

      setCurrentGeoData(data);

      const [lat, lng] = data.loc ? data.loc.split(',') : ['', ''];
      await api.post('/history', {
        ip_address: data.ip,
        city: data.city,
        region: data.region,
        country: data.country,
        latitude: lat,
        longitude: lng,
        timezone: data.timezone
      });

      loadHistory();
    } catch (err) {
      setError('Failed to fetch geolocation data');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchIP('');
    loadUserGeoData();
  };

  const handleHistoryClick = async (historyItem: SearchHistory) => {
    setSearchIP(historyItem.ip_address);
    const geoData: GeoData = {
      ip: historyItem.ip_address,
      city: historyItem.city,
      region: historyItem.region,
      country: historyItem.country,
      loc: historyItem.latitude && historyItem.longitude 
        ? `${historyItem.latitude},${historyItem.longitude}` 
        : undefined,
      timezone: historyItem.timezone
    };
    setCurrentGeoData(geoData);
  };

  const toggleHistorySelection = (id: number) => {
    const newSelected = new Set(selectedHistory);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedHistory(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (selectedHistory.size === 0) return;

    try {
      await api.post('/history/bulk-delete', {
        ids: Array.from(selectedHistory)
      });
      setSelectedHistory(new Set());
      loadHistory();
    } catch (err) {
      setError('Failed to delete history items');
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout', {});
      window.location.href = '/auth/login';
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const [lat, lng] = currentGeoData?.loc ? currentGeoData.loc.split(',') : ['', ''];
  const mapUrl = lat && lng 
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(lng)-0.1},${parseFloat(lat)-0.1},${parseFloat(lng)+0.1},${parseFloat(lat)+0.1}&layer=mapnik&marker=${lat},${lng}`
    : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">IP Geolocation Tracker</h1>
          <Button onClick={handleLogout} variant="outline" className="gap-2">
            <LogOut size={16} />
            Logout
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search size={20} />
              Search IP Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                type="text"
                placeholder="Enter IP address (e.g., 8.8.8.8)"
                value={searchIP}
                onChange={(e) => setSearchIP(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </Button>
              <Button onClick={handleClear} variant="outline">
                <X size={16} />
              </Button>
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Geo Info Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin size={20} />
                Location Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentGeoData ? (
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-semibold text-gray-600">IP Address:</span>
                    <span className="text-gray-800">{currentGeoData.ip}</span>
                  </div>
                  {currentGeoData.city && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-semibold text-gray-600">City:</span>
                      <span className="text-gray-800">{currentGeoData.city}</span>
                    </div>
                  )}
                  {currentGeoData.region && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-semibold text-gray-600">Region:</span>
                      <span className="text-gray-800">{currentGeoData.region}</span>
                    </div>
                  )}
                  {currentGeoData.country && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-semibold text-gray-600">Country:</span>
                      <span className="text-gray-800">{currentGeoData.country}</span>
                    </div>
                  )}
                  {currentGeoData.loc && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-semibold text-gray-600">Coordinates:</span>
                      <span className="text-gray-800">{currentGeoData.loc}</span>
                    </div>
                  )}
                  {currentGeoData.timezone && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-semibold text-gray-600">Timezone:</span>
                      <span className="text-gray-800">{currentGeoData.timezone}</span>
                    </div>
                  )}
                  {currentGeoData.org && (
                    <div className="flex justify-between py-2">
                      <span className="font-semibold text-gray-600">Organization:</span>
                      <span className="text-gray-800 text-right text-sm">{currentGeoData.org}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Loading geolocation data...</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Map Location</CardTitle>
            </CardHeader>
            <CardContent>
              {mapUrl ? (
                <iframe
                  width="100%"
                  height="350"
                  frameBorder="0"
                  scrolling="no"
                  src={mapUrl}
                  className="rounded-lg"
                />
              ) : (
                <div className="h-[350px] bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Map will appear when location is available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Search History</CardTitle>
              {selectedHistory.size > 0 && (
                <Button 
                  onClick={handleDeleteSelected} 
                  variant="destructive" 
                  size="sm"
                  className="gap-2"
                >
                  <Trash2 size={16} />
                  Delete Selected ({selectedHistory.size})
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No search history yet</p>
            ) : (
              <div className="space-y-2">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedHistory.has(item.id)}
                      onChange={() => toggleHistorySelection(item.id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => handleHistoryClick(item)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-800">{item.ip_address}</p>
                          <p className="text-sm text-gray-600">
                            {[item.city, item.region, item.country].filter(Boolean).join(', ')}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(item.searched_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}