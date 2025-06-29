/**
 * SRT (SubRip) subtitle parser utility
 * Parses SRT subtitle files for audio guide synchronization
 */

/**
 * Parse an SRT subtitle string into an array of subtitle objects
 * @param {string} srtContent - The raw SRT file content
 * @returns {Array} Array of subtitle objects with startTime, endTime, and text
 */
export function parseSRT(srtContent) {
  if (!srtContent || typeof srtContent !== 'string') {
    return [];
  }

  const subtitles = [];
  const blocks = srtContent.trim().split(/\n\s*\n/);

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 3) continue;

    const index = parseInt(lines[0], 10);
    if (isNaN(index)) continue;

    const timeLine = lines[1];
    const timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
    
    if (!timeMatch) continue;

    const startTime = parseTimeString(timeMatch[1]);
    const endTime = parseTimeString(timeMatch[2]);
    const text = lines.slice(2).join('\n').trim();

    subtitles.push({
      index,
      startTime,
      endTime,
      text,
      duration: endTime - startTime
    });
  }

  return subtitles.sort((a, b) => a.startTime - b.startTime);
}

/**
 * Convert SRT time string to seconds
 * @param {string} timeString - Time string in format "HH:MM:SS,mmm"
 * @returns {number} Time in seconds
 */
function parseTimeString(timeString) {
  const [time, milliseconds] = timeString.split(',');
  const [hours, minutes, seconds] = time.split(':').map(Number);
  
  return hours * 3600 + minutes * 60 + seconds + parseInt(milliseconds, 10) / 1000;
}

/**
 * Find the active subtitle for a given time
 * @param {Array} subtitles - Array of subtitle objects
 * @param {number} currentTime - Current time in seconds
 * @returns {Object|null} Active subtitle object or null
 */
export function findActiveSubtitle(subtitles, currentTime) {
  return subtitles.find(subtitle => 
    currentTime >= subtitle.startTime && currentTime <= subtitle.endTime
  ) || null;
}

/**
 * Get all subtitles that should be displayed at a given time range
 * @param {Array} subtitles - Array of subtitle objects
 * @param {number} startTime - Start time in seconds
 * @param {number} endTime - End time in seconds
 * @returns {Array} Array of subtitle objects in the time range
 */
export function getSubtitlesInRange(subtitles, startTime, endTime) {
  return subtitles.filter(subtitle => 
    (subtitle.startTime >= startTime && subtitle.startTime <= endTime) ||
    (subtitle.endTime >= startTime && subtitle.endTime <= endTime) ||
    (subtitle.startTime <= startTime && subtitle.endTime >= endTime)
  );
}

/**
 * Convert seconds back to SRT time format
 * @param {number} seconds - Time in seconds
 * @returns {string} Time string in SRT format "HH:MM:SS,mmm"
 */
export function formatTimeToSRT(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 1000);

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
}

/**
 * Validate SRT content format
 * @param {string} srtContent - The raw SRT file content
 * @returns {boolean} True if valid SRT format
 */
export function isValidSRT(srtContent) {
  if (!srtContent || typeof srtContent !== 'string') {
    return false;
  }

  const blocks = srtContent.trim().split(/\n\s*\n/);
  if (blocks.length === 0) return false;

  // Check first block for valid format
  const firstBlock = blocks[0].trim().split('\n');
  if (firstBlock.length < 3) return false;

  // Check if first line is a number
  const index = parseInt(firstBlock[0], 10);
  if (isNaN(index)) return false;

  // Check if second line has time format
  const timeMatch = firstBlock[1].match(/\d{2}:\d{2}:\d{2},\d{3}\s*-->\s*\d{2}:\d{2}:\d{2},\d{3}/);
  return !!timeMatch;
}
