import { TradeType } from '../models/trade-type.model';

export const TRADE_LABELS: Record<TradeType, string> = {
  ELECTRICIAN: 'Electrician',
  PLUMBER: 'Plumber',
  CARPENTER: 'Carpenter',
  MASON: 'Masonry',
  PAINTER: 'Painting',
  TILER: 'Tiling',
  WELDER: 'Welding',
  HELPER: 'Helper',
  DRIVER: 'Driver',
  LABOUR: 'Labour',
  OTHER: 'Other',
};

export const TRADE_ICONS: Record<TradeType, string> = {
  ELECTRICIAN: 'bolt',
  PLUMBER: 'plumbing',
  CARPENTER: 'carpenter',
  MASON: 'construction',
  PAINTER: 'format_paint',
  TILER: 'grid_on',
  WELDER: 'local_fire_department',
  HELPER: 'support',
  DRIVER: 'directions_car',
  LABOUR: 'engineering',
  OTHER: 'handyman',
};
