const KEY = 'starpath.v04.progress';
const fresh = () => ({currentDay:1,completedDays:[],knownObjects:[],abilities:[],lessonProgress:{},logs:[]});

export class ProgressManager {
  constructor(devMode = false) { this.devMode = devMode; this.data = this.load(); }
  load() { try { return {...fresh(), ...JSON.parse(localStorage.getItem(KEY) || '{}')}; } catch { return fresh(); } }
  save() { localStorage.setItem(KEY, JSON.stringify(this.data)); }
  isCompleted(day) { return this.data.completedDays.includes(Number(day)); }
  isUnlocked(day) { return this.devMode || Number(day) <= this.data.currentDay; }
  setStep(day, stepId) { this.data.lessonProgress[day] = {stepId, updatedAt:new Date().toISOString()}; this.save(); }
  complete(lesson) {
    const day = Number(lesson.day);
    this.data.completedDays = [...new Set([...this.data.completedDays, day])].sort((a,b)=>a-b);
    this.data.currentDay = Math.max(this.data.currentDay, Number(lesson.completion?.unlockDay || day + 1));
    this.data.knownObjects = [...new Set([...this.data.knownObjects, ...(lesson.completion?.knownObjects || [])])];
    if (lesson.completion?.ability) this.data.abilities = [...new Set([...this.data.abilities, lesson.completion.ability])];
    delete this.data.lessonProgress[day]; this.save();
  }
  addLog(log) { this.data.logs.push({...log, savedAt:new Date().toISOString()}); this.save(); }
  unlockAll() { this.data.currentDay = 30; this.save(); }
  reset() { this.data = fresh(); this.save(); }
}
