// Vehicle types: Saloon (stored as SEDAN in backend), SUV, Truck. No Bike.
export const VEHICLE_TYPES = [
  { value: 'SEDAN', label: 'Saloon' },
  { value: 'SUV', label: 'SUV' },
  { value: 'TRUCK', label: 'Truck' },
] as const

// For mechanic profile: we show/store SALOON, SUV, TRUCK (no Bike)
export const MECHANIC_VEHICLE_TYPES = ['SALOON', 'SUV', 'TRUCK'] as const

// Mechanic expertise: MECHANICAL (engine/brakes/transmission), ELECTRICAL, AC, OTHER
export const EXPERTISE_OPTIONS = ['MECHANICAL', 'ELECTRICAL', 'AC', 'OTHER'] as const

// Car brands for mechanics (who they work on) and users (vehicle brand)
export const CAR_BRANDS = [
  'Toyota',
  'Honda',
  'Ford',
  'Nissan',
  'Hyundai',
  'Kia',
  'Mercedes-Benz',
  'BMW',
  'Audi',
  'Volkswagen',
  'Lexus',
  'Mazda',
  'Peugeot',
  'Renault',
  'Chevrolet',
  'Jeep',
  'Others',
] as const
