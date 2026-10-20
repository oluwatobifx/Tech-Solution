// =============================================================
//  TechSolutions data & helpers
//  - PARTNERS: sample import/export businesses in the B2B network
//  - Sales tracker storage, money formatting, demo sales
//  Demo site: new listings, partnership requests and sales are
//  saved in the visitor's own browser (localStorage).
// =============================================================
const TS = (() => {
  const SECTORS = ['Agriculture & food', 'Fashion & textiles', 'Beauty & personal care', 'Electronics', 'Building materials', 'Health & pharma', 'Furniture & décor', 'Logistics', 'Energy & solar', 'Crafts & art'];
  const COUNTRIES = ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Côte d’Ivoire', 'Egypt', 'United Kingdom', 'United Arab Emirates', 'China', 'Turkey', 'United States', 'Germany'];

  // Sample (fictional) businesses for the demo directory
  const PARTNERS = [
    { id: 'p1', name: 'Savanna Grains Co.', sector: 'Agriculture & food', trade: ['export'], city: 'Kano', country: 'Nigeria', address: '14 Bompai Road, Kano', site: 'savannagrains.example', about: 'Exports sesame, hibiscus and dried ginger in bulk to Europe and the Middle East.', looking: 'Buyers & freight partners' },
    { id: 'p2', name: 'Adire House Textiles', sector: 'Fashion & textiles', trade: ['export'], city: 'Abeokuta', country: 'Nigeria', address: '3 Itoku Market Road, Abeokuta', site: 'adirehouse.example', about: 'Hand-dyed adire fabrics and ready-to-wear pieces for boutiques worldwide.', looking: 'Retail distributors' },
    { id: 'p3', name: 'GoldCoast Shea Collective', sector: 'Beauty & personal care', trade: ['export'], city: 'Tamale', country: 'Ghana', address: 'Plot 22, Industrial Area, Tamale', site: 'goldcoastshea.example', about: 'Women-led cooperative producing raw and refined shea butter.', looking: 'Cosmetic brands' },
    { id: 'p4', name: 'Nairobi Smart Devices', sector: 'Electronics', trade: ['import'], city: 'Nairobi', country: 'Kenya', address: 'Moi Avenue, Tumaini House, Nairobi', site: 'nairobismart.example', about: 'Imports phones, accessories and solar lamps for East African retailers.', looking: 'Manufacturers & wholesalers' },
    { id: 'p5', name: 'Cape Build Supplies', sector: 'Building materials', trade: ['import', 'export'], city: 'Cape Town', country: 'South Africa', address: '18 Marine Drive, Paarden Eiland', site: 'capebuild.example', about: 'Tiles, sanitary ware and roofing — sourcing globally, supplying the region.', looking: 'Suppliers & contractors' },
    { id: 'p6', name: 'Lagoon Pharma Distribution', sector: 'Health & pharma', trade: ['import'], city: 'Lagos', country: 'Nigeria', address: '27 Creek Road, Apapa, Lagos', site: 'lagoonpharma.example', about: 'Licensed importer and distributor of generic medicines and medical supplies.', looking: 'Certified manufacturers' },
    { id: 'p7', name: 'Atlas Home & Décor', sector: 'Furniture & décor', trade: ['import'], city: 'Dubai', country: 'United Arab Emirates', address: 'Al Quoz Industrial 3, Dubai', site: 'atlashome.example', about: 'Buys handmade African décor, baskets and wood carvings for Gulf retail.', looking: 'Artisan exporters' },
    { id: 'p8', name: 'Abidjan Cocoa Partners', sector: 'Agriculture & food', trade: ['export'], city: 'Abidjan', country: 'Côte d’Ivoire', address: 'Zone 4C, Rue du Canal, Abidjan', site: 'abidjancocoa.example', about: 'Traceable cocoa beans and cocoa butter from smallholder farms.', looking: 'Chocolate makers' },
    { id: 'p9', name: 'Sunbridge Energy Imports', sector: 'Energy & solar', trade: ['import'], city: 'Abuja', country: 'Nigeria', address: '9 Aminu Kano Crescent, Wuse 2, Abuja', site: 'sunbridge.example', about: 'Imports solar panels, inverters and batteries for homes and SMEs.', looking: 'Panel manufacturers' },
    { id: 'p10', name: 'Anatolia Trade Hub', sector: 'Fashion & textiles', trade: ['export'], city: 'Istanbul', country: 'Turkey', address: 'Merter Tekstil Merkezi, Istanbul', site: 'anatoliatrade.example', about: 'Wholesale fabrics and garments for African fashion retailers.', looking: 'Importers in West Africa' },
    { id: 'p11', name: 'Kente Crafts Ghana', sector: 'Crafts & art', trade: ['export'], city: 'Kumasi', country: 'Ghana', address: 'Adum, Prempeh II Street, Kumasi', site: 'kentecrafts.example', about: 'Authentic kente cloth, beads and art pieces for galleries and gift shops.', looking: 'Gift & museum stores' },
    { id: 'p12', name: 'Thames Afro Foods', sector: 'Agriculture & food', trade: ['import'], city: 'London', country: 'United Kingdom', address: 'Unit 5, Peckham Trade Park, London', site: 'thamesafro.example', about: 'Imports African food products for UK supermarkets and stores.', looking: 'Certified food exporters' },
  ];

  // ---------- safe storage ----------
  const store = {
    get(k, f) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch { return f; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
  };

  const myListings = () => store.get('ts_listings', []);
  const addListing = (b) => { const l = myListings(); l.unshift(b); store.set('ts_listings', l); };
  const allPartners = () => [...myListings(), ...PARTNERS];
  const saveRequest = (r) => { const l = store.get('ts_requests', []); l.unshift(r); store.set('ts_requests', l); };

  // ---------- sales tracker ----------
  const CHANNELS = { store: 'Online store', b2b: 'B2B / export', mkt: 'Marketplace & social', shop: 'Physical shop' };
  function demoSales() {
    const items = [
      ['Shea butter (500g)', 'store', 12, 4500], ['Adire fabric (6 yards)', 'mkt', 4, 18000], ['Shea butter (500g)', 'b2b', 200, 3200],
      ['Black soap (bar)', 'store', 25, 1500], ['Hibiscus tea (1kg)', 'b2b', 80, 5200], ['Adire fabric (6 yards)', 'store', 6, 18000],
      ['Black soap (bar)', 'shop', 30, 1500], ['Hibiscus tea (1kg)', 'mkt', 9, 6500], ['Gift box', 'store', 7, 22000],
      ['Shea butter (500g)', 'mkt', 15, 4800], ['Gift box', 'shop', 4, 22000], ['Hibiscus tea (1kg)', 'store', 11, 6500],
    ];
    const now = Date.now();
    return items.map(([product, channel, qty, price], i) => ({ id: 'd' + i, product, channel, qty, price, customer: '', date: new Date(now - (i * 2 + 1) * 864e5).toISOString().slice(0, 10) }));
  }
  const sales = () => store.get('ts_sales', null) ?? demoSales();
  const saveSales = (s) => store.set('ts_sales', s);

  const money = (n) => '₦' + Math.round(n).toLocaleString('en-NG');
  const initials = (name) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const mapsUrl = (q) => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);

  return { SECTORS, COUNTRIES, PARTNERS, allPartners, addListing, saveRequest, CHANNELS, sales, saveSales, demoSales, money, initials, mapsUrl };
})();
