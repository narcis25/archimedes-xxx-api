import express from 'express';
import {postMessage} from './post';

export const HistoryRouter = express.Router();

HistoryRouter.route('/history')
  .post(postMessage);
