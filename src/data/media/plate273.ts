import { src } from '../sources'

/*
  Plate 273, "Baseball, pitching": Eadweard Muybridge's Animal Locomotion (1887),
  photographed at the University of Pennsylvania. The side-view sequence is ten
  frames from the set to the follow-through. The ten silhouettes in `src` were
  traced from the Wikimedia Commons scan of each frame (a person-segmentation
  mask per frame, hips centred, feet on one ground line). Only the outline ships;
  the photographs stay in the archive. Frame n is symbol `#f{n}`. The file name
  carries the first 8 hex of its sha256, because /presentation/ is cached
  immutable.
*/
export const PLATE_273 = {
  src: '/presentation/plate-273-delivery-74b87a4c.svg',
  /** outer viewBox for a frame; each symbol maps its own box into it */
  viewBox: '0 0 101.6 102',
  frames: 10,
  plate: 273,
  title: 'Baseball, pitching',
  maker: 'Eadweard Muybridge',
  work: 'Animal Locomotion',
  year: 1887,
  rights: 'public-domain',
  source: src('commons-muybridge-plate-273'),
} as const
