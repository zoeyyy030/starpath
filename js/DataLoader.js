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
  async discoverLessons(maxDay = 60) {
    const lessons = [];
    for (let day = 1; day <= maxDay; day += 1) {
      try { lessons.push(await this.loadLesson(day)); }
      catch (error) {
        if (day === 1) throw error;
        break;
      }
    }
    return lessons;
  }
  async loadObjects(ids = []) {
    const list = await Promise.all([...new Set(ids)].map(id => this.json(`objects/${id}.json`)));
    return new Map(list.map(item => [item.id, item]));
  }
}
