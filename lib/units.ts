/**
 * Unit Conversion Utilities for Kerala Riders App
 * 
 * This module provides comprehensive conversion functions for:
 * - Converting user inputs to database standard units (meters, seconds, m/s, etc.)
 * - Converting database values to user-friendly display formats
 * - Supporting both metric and imperial unit systems
 */

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type DistanceUnit = 'km' | 'm' | 'mi' | 'ft' | 'yd';
export type TimeUnit = 'h' | 'min' | 's' | 'ms';
export type SpeedUnit = 'km/h' | 'mph' | 'm/s' | 'min/km' | 'min/mi';
export type ElevationUnit = 'm' | 'ft';
export type PowerUnit = 'W' | 'kW';
export type UnitSystem = 'metric' | 'imperial';

export interface UserPreferences {
  unitSystem: UnitSystem;
  distanceUnit: DistanceUnit;
  speedUnit: SpeedUnit;
  elevationUnit: ElevationUnit;
}

export interface DisplayFormats {
  distance: string;
  duration: string;
  speed: string;
  pace: string;
  elevation: string;
  power: string;
  heartRate: string;
  cadence: string;
}

// =============================================================================
// INPUT → DATABASE CONVERSIONS (User Input to Standard Units)
// =============================================================================

/**
 * Convert distance to meters (database standard)
 */
export function convertDistanceToMeters(value: number, unit: DistanceUnit): number {
  switch (unit) {
    case 'km':
      return value * 1000;
    case 'm':
      return value;
    case 'mi':
      return value * 1609.344;
    case 'ft':
      return value * 0.3048;
    case 'yd':
      return value * 0.9144;
    default:
      return value;
  }
}

/**
 * Convert time components to seconds (database standard)
 */
export function convertTimeToSeconds(hours: number = 0, minutes: number = 0, seconds: number = 0): number {
  return (hours * 3600) + (minutes * 60) + seconds;
}

/**
 * Convert various speed formats to meters per second (database standard)
 */
export function convertSpeedToMeterPerSecond(value: number, unit: SpeedUnit): number {
  switch (unit) {
    case 'km/h':
      return value / 3.6;
    case 'mph':
      return value * 0.44704;
    case 'm/s':
      return value;
    case 'min/km':
      // Pace: minutes per kilometer -> m/s
      return value > 0 ? 1000 / (value * 60) : 0;
    case 'min/mi':
      // Pace: minutes per mile -> m/s
      return value > 0 ? 1609.344 / (value * 60) : 0;
    default:
      return value;
  }
}

/**
 * Convert elevation to meters (database standard)
 */
export function convertElevationToMeters(value: number, unit: ElevationUnit): number {
  switch (unit) {
    case 'm':
      return value;
    case 'ft':
      return value * 0.3048;
    default:
      return value;
  }
}

/**
 * Convert power to watts (database standard)
 */
export function convertPowerToWatts(value: number, unit: PowerUnit): number {
  switch (unit) {
    case 'W':
      return value;
    case 'kW':
      return value * 1000;
    default:
      return value;
  }
}

// =============================================================================
// DATABASE → DISPLAY CONVERSIONS (Standard Units to User-Friendly Display)
// =============================================================================

/**
 * Format distance from meters to user-friendly display
 */
export function formatDistance(meters: number, preferredUnit: DistanceUnit = 'km', decimals: number = 1): string {
  if (meters === 0) return '0 m';
  
  switch (preferredUnit) {
    case 'km':
      const km = meters / 1000;
      if (km < 1) {
        return `${Math.round(meters)} m`;
      }
      return `${km.toFixed(decimals)} km`;
    
    case 'm':
      return `${Math.round(meters)} m`;
    
    case 'mi':
      const miles = meters / 1609.344;
      if (miles < 0.1) {
        const feet = meters / 0.3048;
        return `${Math.round(feet)} ft`;
      }
      return `${miles.toFixed(decimals)} mi`;
    
    case 'ft':
      const feet = meters / 0.3048;
      return `${Math.round(feet)} ft`;
    
    case 'yd':
      const yards = meters / 0.9144;
      return `${Math.round(yards)} yd`;
    
    default:
      return `${Math.round(meters)} m`;
  }
}

/**
 * Format duration from seconds to user-friendly display
 */
export function formatDuration(seconds: number, format: 'short' | 'long' | 'compact' = 'short'): string {
  if (seconds === 0) return '0s';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  switch (format) {
    case 'long':
      const parts = [];
      if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
      if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
      if (remainingSeconds > 0) parts.push(`${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`);
      return parts.join(', ');
    
    case 'compact':
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
      }
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    
    case 'short':
    default:
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      if (minutes > 0) {
        return `${minutes}m`;
      }
      return `${remainingSeconds}s`;
  }
}

/**
 * Format speed from m/s based on sport type and user preference
 */
export function formatSpeed(
  meterPerSecond: number, 
  sportType: string, 
  preferredUnit?: SpeedUnit
): string {
  if (!meterPerSecond || meterPerSecond === 0) return '-';

  // Auto-determine preferred unit based on sport type if not specified
  if (!preferredUnit) {
    const sport = sportType.toLowerCase();
    if (sport.includes('run') || sport.includes('walk')) {
      preferredUnit = 'min/km';
    } else {
      preferredUnit = 'km/h';
    }
  }

  switch (preferredUnit) {
    case 'km/h':
      const kmh = meterPerSecond * 3.6;
      return `${kmh.toFixed(1)} km/h`;
    
    case 'mph':
      const mph = meterPerSecond * 2.23694;
      return `${mph.toFixed(1)} mph`;
    
    case 'm/s':
      return `${meterPerSecond.toFixed(2)} m/s`;
    
    case 'min/km':
      const minPerKm = 1000 / (meterPerSecond * 60);
      const minutes = Math.floor(minPerKm);
      const seconds = Math.round((minPerKm - minutes) * 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')} min/km`;
    
    case 'min/mi':
      const minPerMile = 1609.344 / (meterPerSecond * 60);
      const minMi = Math.floor(minPerMile);
      const secMi = Math.round((minPerMile - minMi) * 60);
      return `${minMi}:${secMi.toString().padStart(2, '0')} min/mi`;
    
    default:
      return `${(meterPerSecond * 3.6).toFixed(1)} km/h`;
  }
}

/**
 * Format pace from m/s (specialized version of formatSpeed for pace display)
 */
export function formatPace(meterPerSecond: number, preferredUnit: 'min/km' | 'min/mi' = 'min/km'): string {
  if (!meterPerSecond || meterPerSecond === 0) return '-';

  switch (preferredUnit) {
    case 'min/km':
      const minPerKm = 1000 / (meterPerSecond * 60);
      const minutes = Math.floor(minPerKm);
      const seconds = Math.round((minPerKm - minutes) * 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    case 'min/mi':
      const minPerMile = 1609.344 / (meterPerSecond * 60);
      const minMi = Math.floor(minPerMile);
      const secMi = Math.round((minPerMile - minMi) * 60);
      return `${minMi}:${secMi.toString().padStart(2, '0')}`;
    
    default:
      return formatPace(meterPerSecond, 'min/km');
  }
}

/**
 * Get pace unit string for display
 */
export function getPaceUnit(preferredUnit: 'min/km' | 'min/mi' = 'min/km'): string {
  return preferredUnit;
}

/**
 * Format elevation from meters
 */
export function formatElevation(meters: number, preferredUnit: ElevationUnit = 'm'): string {
  if (meters === 0) return 'no elevation';
  
  switch (preferredUnit) {
    case 'm':
      return `${Math.round(meters)} m`;
    case 'ft':
      const feet = meters * 3.28084;
      return `${Math.round(feet)} ft`;
    default:
      return `${Math.round(meters)} m`;
  }
}

/**
 * Format power in watts
 */
export function formatPower(watts: number): string {
  if (watts === 0) return '0 W';
  
  if (watts >= 1000) {
    return `${(watts / 1000).toFixed(1)} kW`;
  }
  
  return `${Math.round(watts)} W`;
}

/**
 * Format heart rate in BPM
 */
export function formatHeartRate(bpm: number): string {
  if (bpm === 0) return '-';
  return `${Math.round(bpm)} bpm`;
}

/**
 * Format cadence in RPM
 */
export function formatCadence(rpm: number): string {
  if (rpm === 0) return '-';
  return `${Math.round(rpm)} rpm`;
}

/**
 * Format date to user-friendly string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Format time to user-friendly string
 */
export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// =============================================================================
// SPORT-SPECIFIC UTILITIES
// =============================================================================

/**
 * Determine appropriate speed unit based on sport type
 */
export function getPreferredSpeedUnit(sportType: string): SpeedUnit {
  const sport = sportType.toLowerCase();
  
  if (sport.includes('run') || sport.includes('walk')) {
    return 'min/km';
  }
  
  if (sport.includes('cycle') || sport.includes('bike') || sport.includes('ride')) {
    return 'km/h';
  }
  
  if (sport.includes('swim')) {
    return 'min/km'; // Swimming pace is usually shown as time per distance
  }
  
  // Default to km/h for other sports
  return 'km/h';
}

/**
 * Get sport type icon name for Ionicons
 */
export function getSportIcon(sportType: string): string {
  const sport = sportType.toLowerCase();
  
  if (sport.includes('run')) return 'walk';
  if (sport.includes('cycle') || sport.includes('bike') || sport.includes('ride')) return 'bicycle';
  if (sport.includes('walk')) return 'walk';
  if (sport.includes('swim')) return 'water';
  if (sport.includes('strength') || sport.includes('gym')) return 'barbell';
  if (sport.includes('hike')) return 'trail-sign';
  
  return 'fitness'; // Default icon
}

/**
 * Get sport type color
 */
export function getSportColor(sportType: string): string {
  const sport = sportType.toLowerCase();
  
  if (sport.includes('run')) return '#F7931E';
  if (sport.includes('cycle') || sport.includes('bike') || sport.includes('ride')) return '#14A76C';
  if (sport.includes('walk')) return '#8B5CF6';
  if (sport.includes('swim')) return '#06B6D4';
  if (sport.includes('strength') || sport.includes('gym')) return '#EF4444';
  if (sport.includes('hike')) return '#84CC16';
  
  return '#6B7280'; // Default gray
}

// =============================================================================
// UTILITY HELPERS
// =============================================================================

/**
 * Default user preferences (metric system)
 */
export const defaultUserPreferences: UserPreferences = {
  unitSystem: 'metric',
  distanceUnit: 'km',
  speedUnit: 'km/h',
  elevationUnit: 'm',
};

/**
 * Imperial user preferences
 */
export const imperialUserPreferences: UserPreferences = {
  unitSystem: 'imperial',
  distanceUnit: 'mi',
  speedUnit: 'mph',
  elevationUnit: 'ft',
};

/**
 * Parse time string (HH:MM or H:MM) to minutes
 */
export function parseTimeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

/**
 * Convert minutes to time string (HH:MM)
 */
export function formatMinutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Validate numeric input for conversions
 */
export function isValidNumber(value: any): boolean {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Safe number conversion with default fallback
 */
export function safeNumber(value: any, defaultValue: number = 0): number {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isValidNumber(num) ? num : defaultValue;
}