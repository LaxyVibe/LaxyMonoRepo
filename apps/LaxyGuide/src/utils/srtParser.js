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

    // Handle timestamps that might be broken across multiple lines
    let timeLine = lines[1];
    let textStartIndex = 2;

    // Check if timestamp is incomplete (missing end time)
    if (timeLine.includes('-->') && !timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/)) {
      // Timestamp is broken across lines, combine with next line
      if (lines.length > 2) {
        timeLine = timeLine.trim() + ' ' + lines[2].trim();
        textStartIndex = 3;
      }
    }

    const timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
    
    if (!timeMatch) continue;

    const startTime = parseTimeString(timeMatch[1]);
    const endTime = parseTimeString(timeMatch[2]);
    const text = lines.slice(textStartIndex).join('\n').trim();

    // Skip empty text entries
    if (!text) continue;

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

  // Check if second line has time format (might be broken across lines)
  let timeLine = firstBlock[1];
  if (timeLine.includes('-->') && !timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/)) {
    // Try combining with next line if timestamp is broken
    if (firstBlock.length > 2) {
      timeLine = timeLine.trim() + ' ' + firstBlock[2].trim();
    }
  }

  const timeMatch = timeLine.match(/\d{2}:\d{2}:\d{2},\d{3}\s*-->\s*\d{2}:\d{2}:\d{2},\d{3}/);
  return !!timeMatch;
}
