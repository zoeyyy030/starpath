export class QuizEngine {
  constructor(sky) { this.sky = sky; this.step = null; }
  start(step) { this.step = step; }
  answer(pointId) {
    if (!this.step) return {handled:false};
    const correct = this.sky.targetMatches(pointId, this.step.target);
    return {handled:true, correct, message:correct ? '✓ 正确，目标已找到。' : (this.step.retryHint || '再观察一下形状和相邻路标。')};
  }
  reset() { this.step = null; }
}
