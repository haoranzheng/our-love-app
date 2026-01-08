// GCJ-02 (Mars Geodetic System) <-> WGS-84 Conversion Utils
// Based on standard algorithms widely used in Chinese mapping applications

const x_pi = 3.14159265358979324 * 3000.0 / 180.0;
const pi = 3.1415926535897932384626;
const a = 6378245.0;
const ee = 0.00669342162296594323;

function transformLat(x: number, y: number): number {
    let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(y * pi) + 40.0 * Math.sin(y / 3.0 * pi)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(y / 12.0 * pi) + 320 * Math.sin(y * pi / 30.0)) * 2.0 / 3.0;
    return ret;
}

function transformLon(x: number, y: number): number {
    let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(x * pi) + 40.0 * Math.sin(x / 3.0 * pi)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(x / 12.0 * pi) + 300.0 * Math.sin(x / 30.0 * pi)) * 2.0 / 3.0;
    return ret;
}

/**
 * WGS-84 to GCJ-02
 * @param lng WGS-84 Longitude
 * @param lat WGS-84 Latitude
 * @returns [lng, lat] in GCJ-02
 */
export function wgs84togcj02(lng: number, lat: number): [number, number] {
    if (outOfChina(lng, lat)) {
        return [lng, lat];
    }
    let dLat = transformLat(lng - 105.0, lat - 35.0);
    let dLon = transformLon(lng - 105.0, lat - 35.0);
    const radLat = lat / 180.0 * pi;
    let magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic;
    const sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * pi);
    dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * pi);
    const mglat = lat + dLat;
    const mglng = lng + dLon;
    return [mglng, mglat];
}

/**
 * GCJ-02 to WGS-84
 * @param lng GCJ-02 Longitude
 * @param lat GCJ-02 Latitude
 * @returns [lng, lat] in WGS-84
 */
export function gcj02towgs84(lng: number, lat: number): [number, number] {
    if (outOfChina(lng, lat)) {
        return [lng, lat];
    }
    let dLat = transformLat(lng - 105.0, lat - 35.0);
    let dLon = transformLon(lng - 105.0, lat - 35.0);
    const radLat = lat / 180.0 * pi;
    let magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic;
    const sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * pi);
    dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * pi);
    const mglat = lat + dLat;
    const mglng = lng + dLon;
    return [lng * 2 - mglng, lat * 2 - mglat];
}

function outOfChina(lng: number, lat: number): boolean {
    // 简单的中国国境矩形判断，不够精确但够用
    return !(lng > 73.66 && lng < 135.05 && lat > 3.86 && lat < 53.55);
}
