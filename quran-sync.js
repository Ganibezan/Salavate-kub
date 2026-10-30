(() => {
'use strict';
// Exact MP3Quran boundaries; playbackRate never changes media.currentTime.
const timing=window.quranVerseTimings?.surahs||{};
window.QuranSync={
rows:number=>timing[String(number)]||[],
at(number,seconds){const rows=timing[String(number)]||[],ms=Math.round(seconds*1000);let lo=0,hi=rows.length-1;while(lo<=hi){const mid=(lo+hi)>>1,row=rows[mid];if(ms<row[1])hi=mid-1;else if(ms>=row[2])lo=mid+1;else return row[0]}return 0},
start(number,ayah){const row=(timing[String(number)]||[]).find(row=>row[0]===ayah);return row?row[1]/1000:null}
};
})();
