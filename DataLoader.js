export class DataLoader {
  constructor() { this.base = new URL('../data/', import.meta.url); this.cache = new Map(); }
  async json(path) {
    if (this.cache.has(path)) return this.cache.get(path);
    const response = await fetch(new URL(path, this.base));
    if (!response.ok) throw new Error(`无法加载 ${path}（${response.status}）`);
    const data = await response.json(); this.cache.set(path, data); return data;
  }
  loadManifest() { return this.json('lessons/index.json'); }
  loadLesson(day) { return this.json(`lessons/day${String(day).padStart(2, '0')}.json`); }
  async discoverLessons(maxDay = 60, batchSize = 5) {
    const lessons = [];
    for (let start = 1; start <= maxDay; start += batchSize) {
      const days = Array.from(
        {length: Math.min(batchSize, maxDay - start + 1)},
        (_, index) => start + index
      );
      const results = await Promise.allSettled(days.map(day => this.loadLesson(day)));
      for (let index = 0; index < results.length; index += 1) {
        const result = results[index];
        if (result.status === 'fulfilled') lessons.push(result.value);
        else {
          if (days[index] === 1) throw result.reason;
          return lessons;
        }
      }
    }
    return lessons;
  }
  async loadObjects(ids = []) {
    const list = await Promise.all([...new Set(ids)].map(id => this.json(`objects/${id}.json`)));
    return new Map(list.map(item => [item.id, item]));
  }
}
