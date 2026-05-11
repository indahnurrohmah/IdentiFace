from math import radians, sin, cos, sqrt, atan2

#FT UGM
CAMPUS_LATITUDE = -7.765347557669016
CAMPUS_LONGITUDE = 110.37221185641494
ALLOWED_RADIUS_METERS = 200

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371000

    lat1_rad = radians(lat1)
    lat2_rad = radians(lat2)
    delta_lat = radians(lat2 - lat1)
    delta_lon = radians(lon2 - lon1)

    # Rumus Haversine
    a = sin(delta_lat / 2) ** 2 + cos(lat1_rad) * cos(lat2_rad) * sin(delta_lon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return R * c

def validate_location(user_lat: float, user_lon: float) -> dict:
    distance = haversine_distance(
        CAMPUS_LATITUDE, CAMPUS_LONGITUDE,
        user_lat, user_lon
    )

    return {
        "is_valid": distance <= ALLOWED_RADIUS_METERS,
        "distance_meters": round(distance, 2),
        "max_radius": ALLOWED_RADIUS_METERS
    }