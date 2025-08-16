import { AppController } from './app.controller';

describe('AppController', () => {
  it('GET / should return message', () => {
    const c = new AppController();
    expect(c.root()).toEqual({
      message: 'Fullstack Challenge 🏅 - Dictionary',
    });
  });
});
