import mongoose from 'mongoose';
import { config } from '../config/environment.js';
import { Load } from '../models/Load.model.js';
import { User } from '../models/User.model.js';
import { logger } from '../utils/logger.js';

// Realistic load data generator with coordinates
const cities = [
  { city: 'New York', state: 'NY', zip: '10001', lat: 40.7128, lng: -74.0060 },
  { city: 'Los Angeles', state: 'CA', zip: '90001', lat: 34.0522, lng: -118.2437 },
  { city: 'Chicago', state: 'IL', zip: '60601', lat: 41.8781, lng: -87.6298 },
  { city: 'Houston', state: 'TX', zip: '77001', lat: 29.7604, lng: -95.3698 },
  { city: 'Phoenix', state: 'AZ', zip: '85001', lat: 33.4484, lng: -112.0740 },
  { city: 'Philadelphia', state: 'PA', zip: '19101', lat: 39.9526, lng: -75.1652 },
  { city: 'San Antonio', state: 'TX', zip: '78201', lat: 29.4241, lng: -98.4936 },
  { city: 'San Diego', state: 'CA', zip: '92101', lat: 32.7157, lng: -117.1611 },
  { city: 'Dallas', state: 'TX', zip: '75201', lat: 32.7767, lng: -96.7970 },
  { city: 'San Jose', state: 'CA', zip: '95101', lat: 37.3382, lng: -121.8863 },
  { city: 'Austin', state: 'TX', zip: '73301', lat: 30.2672, lng: -97.7431 },
  { city: 'Jacksonville', state: 'FL', zip: '32201', lat: 30.3322, lng: -81.6557 },
  { city: 'Fort Worth', state: 'TX', zip: '76101', lat: 32.7555, lng: -97.3308 },
  { city: 'Columbus', state: 'OH', zip: '43201', lat: 39.9612, lng: -82.9988 },
  { city: 'Charlotte', state: 'NC', zip: '28201', lat: 35.2271, lng: -80.8431 },
  { city: 'San Francisco', state: 'CA', zip: '94102', lat: 37.7749, lng: -122.4194 },
  { city: 'Indianapolis', state: 'IN', zip: '46201', lat: 39.7684, lng: -86.1581 },
  { city: 'Seattle', state: 'WA', zip: '98101', lat: 47.6062, lng: -122.3321 },
  { city: 'Denver', state: 'CO', zip: '80201', lat: 39.7392, lng: -104.9903 },
  { city: 'Boston', state: 'MA', zip: '02101', lat: 42.3601, lng: -71.0589 },
  { city: 'Atlanta', state: 'GA', zip: '30301', lat: 33.7490, lng: -84.3880 },
  { city: 'Miami', state: 'FL', zip: '33101', lat: 25.7617, lng: -80.1918 },
  { city: 'Detroit', state: 'MI', zip: '48201', lat: 42.3314, lng: -83.0458 },
  { city: 'Memphis', state: 'TN', zip: '38101', lat: 35.1495, lng: -90.0490 },
  { city: 'Portland', state: 'OR', zip: '97201', lat: 45.5152, lng: -122.6784 },
  { city: 'Nashville', state: 'TN', zip: '37201', lat: 36.1627, lng: -86.7816 },
  { city: 'Milwaukee', state: 'WI', zip: '53201', lat: 43.0389, lng: -87.9065 },
  { city: 'Tucson', state: 'AZ', zip: '85701', lat: 32.2226, lng: -110.9747 },
  { city: 'Minneapolis', state: 'MN', zip: '55401', lat: 44.9778, lng: -93.2650 },
  { city: 'Cleveland', state: 'OH', zip: '44101', lat: 41.4993, lng: -81.6944 }
];

const equipmentTypes = ['Dry Van', 'Refrigerated', 'Flatbed', 'Step Deck', 'Double Drop', 'Lowboy', 'Container', 'Box Truck'];
const rateTypes = ['Per Mile', 'Flat Rate', 'Per Load'];
const loadDescriptions = [
  'Immediate pickup needed, standard freight',
  'Temperature controlled shipment',
  'Fragile items, careful handling required',
  'Time-sensitive delivery',
  'Heavy machinery, specialized equipment',
  'Automotive parts shipment',
  'Consumer goods delivery',
  'Construction materials',
  'Food and beverage delivery',
  'Hazardous materials - certified carriers only',
  'High-value electronics',
  'Pharmaceutical shipment',
  'Appliance delivery',
  'Furniture transport',
  'Agricultural products'
];

const companyNames = [
  'Elite Logistics LLC', 'Premium Freight Solutions', 'Coast to Coast Transport',
  'National Cargo Lines', 'Express Freight Services', 'American Haulers Inc',
  'Blue Ridge Logistics', 'Pacific Transport Group', 'Great Plains Freight',
  'Summit Cargo Company', 'Thunder Bay Transport', 'Golden Gate Logistics',
  'Sunset Freight Lines', 'Majestic Transport Co', 'Pride Logistics LLC',
  'Horizon Cargo Services', 'Victory Freight Lines', 'Diamond Transport Inc',
  'Royal Logistics Group', 'United Cargo Solutions', 'First Class Freight'
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function calculateDistance(_origin: any, _destination: any): number {
  // Simple approximate distance calculation
  return Math.floor(Math.random() * 2000) + 200; // 200-2200 miles
}

async function seedLoads() {
  try {
    logger.info('Starting load seeding...');

    // Connect to database
    await mongoose.connect(config.MONGODB_URI);
    logger.info('Connected to MongoDB');

    // Clear existing loads (optional - comment out if you want to keep existing)
    await Load.deleteMany({});
    logger.info('Cleared existing loads');

    // Get all broker users
    const brokers = await User.find({ accountType: 'broker' });
    
    if (brokers.length === 0) {
      logger.warn('No broker users found. Creating demo brokers...');
      
      // Create some demo brokers
      for (let i = 0; i < 10; i++) {
        const broker = new User({
          email: `broker${i + 1}@demo.com`,
          password: '$2b$10$DemoHashedPassword123456789',
          accountType: 'broker',
          company: companyNames[i],
          usdotNumber: `USDOT${1000000 + i}`,
          mcNumber: `MC-${1000000 + i}`,
          isEmailVerified: true,
          subscriptionPlan: 'premium',
          premiumExpires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        });
        await broker.save();
      }
      
      const updatedBrokers = await User.find({ accountType: 'broker' });
      logger.info(`Created ${updatedBrokers.length} demo brokers`);
    }

    const allBrokers = await User.find({ accountType: 'broker' });
    logger.info(`Found ${allBrokers.length} broker(s)`);

    // Generate realistic loads
    const loads = [];
    
    for (let i = 0; i < 500; i++) {
      const origin = getRandomElement(cities);
      const destination = getRandomElement(cities.filter(c => c.city !== origin.city));
      const equipment = getRandomElement(equipmentTypes);
      const rateType = getRandomElement(rateTypes);
      const description = getRandomElement(loadDescriptions);
      const postedBy = getRandomElement(allBrokers)._id;
      
      // Generate realistic rate based on equipment and distance
      let baseRate = 0;
      const distance = calculateDistance(origin, destination);
      
      if (equipment === 'Dry Van') baseRate = distance * 2.5;
      else if (equipment === 'Refrigerated') baseRate = distance * 3.5;
      else if (equipment === 'Flatbed') baseRate = distance * 3;
      else if (equipment.includes('Lowboy')) baseRate = distance * 4.5;
      else baseRate = distance * 2;
      
      // Add randomness ±20%
      const rate = Math.floor(baseRate * (0.8 + Math.random() * 0.4));
      
      // Pickup date: 1-7 days from now
      const pickupDate = new Date();
      pickupDate.setDate(pickupDate.getDate() + Math.floor(Math.random() * 7) + 1);

      // Weight: 15,000 - 45,000 lbs
      const weight = Math.floor(Math.random() * 30000) + 15000;

      const load = {
        title: `${equipment} Load: ${origin.city}, ${origin.state} → ${destination.city}, ${destination.state}`,
        description,
        origin: {
          city: origin.city,
          state: origin.state,
          zip: origin.zip,
          country: 'US',
          coordinates: { lat: origin.lat, lng: origin.lng }
        },
        destination: {
          city: destination.city,
          state: destination.state,
          zip: destination.zip,
          country: 'US',
          coordinates: { lat: destination.lat, lng: destination.lng }
        },
        equipmentType: equipment,
        weight,
        rate,
        rateType,
        pickupDate,
        deliveryDate: new Date(pickupDate.getTime() + (distance / 50) * 24 * 60 * 60 * 1000),
        distance,
        status: Math.random() > 0.1 ? 'available' : 'booked',
        postedBy
      };

      loads.push(load);
    }

    // Insert in batches
    const batchSize = 50;
    for (let i = 0; i < loads.length; i += batchSize) {
      const batch = loads.slice(i, i + batchSize);
      await Load.insertMany(batch);
      logger.info(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(loads.length / batchSize)}`);
    }

    logger.info(`Successfully seeded ${loads.length} realistic loads!`);
    
    // Close connection
    await mongoose.disconnect();
    logger.info('Database connection closed');
    process.exit(0);
  } catch (error: any) {
    logger.error('Seeding failed', { error: error.message });
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run if called directly
seedLoads();

