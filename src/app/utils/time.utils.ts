export function parseTimeToSeconds(timeString: string): number {
  const [minutes, seconds] = timeString.split(':').map(Number);
  return minutes * 60 + seconds;
}
