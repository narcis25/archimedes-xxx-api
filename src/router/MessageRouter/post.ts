import {firestore} from 'firebase-admin';
import {Request, Response} from 'express';

export const postMessage = async (req: Request, res: Response) => {
  //const {message} = req.query;

  console.log(req.body);

  //const message = req.body.params.data;

  /*console.log(req.query);
  console.log(message);*/

  /*const ref = firestore().collection('message');
  await ref.add({message});
  res.status(200).send('message added');*/

  const ref = firestore().collection('message').doc('test');
  await ref.set(req.body.params);
  res.status(200).send('message added');

  /*await ref.add({message});
  res.status(200).send('message added');*/
};
