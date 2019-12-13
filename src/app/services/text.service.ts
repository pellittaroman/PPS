import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Text } from '../models/text';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { TipoLista } from '../models/enums/tipo-lista.enum';
import { SpinnerService } from './spinner.service';

@Injectable({
  providedIn: 'root'
})
export class TextService {

  textRef: AngularFireList<Text>;

  constructor(db: AngularFireDatabase, private spinner: SpinnerService) {
    this.textRef = db.list('texts');
    this.textRef.snapshotChanges().subscribe( x => {
      this.spinner.hide();
    });
  }

  save(text: Text) {
    this.spinner.show();
    return this.textRef.push(text);
  }
  updateItem(key: string, text: Text) {
    this.spinner.show();
    return this.textRef.update(key, text);
  }
  deleteItem(key: string) {
    this.spinner.show();
    return this.textRef.remove(key);
  }
  deleteEverything() {
    this.spinner.show();
    return this.textRef.remove();
  }

  GetAlltexts() {
    this.spinner.show();
    return this.textRef.snapshotChanges()
    .pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    )
    .pipe(
      map(texts => {
        return texts.map(text => {
          text.fechaString = new Date(text.fecha).toLocaleString();
          return text;
        });
      })
    );
  }

  GetAlltextsByType(tipo: TipoLista) {
    this.spinner.show();
    return this.GetAlltexts().pipe(
      map(texts => {
        this.spinner.hide();
        return texts.filter(text => {
          switch (tipo) {
            case TipoLista.A:
              return text.division === TipoLista.A;
            case TipoLista.B:
              return text.division === TipoLista.B;
          }
        });
      })
    );
  }

  GettextsByUser(uid: String, tipo: TipoLista) {
    this.spinner.show();
    return this.GetAlltextsByType(tipo).pipe(
      map(texts => {
        return texts.filter(text => {
          this.spinner.hide();
          return text.uid === uid;
        });
      })
    );
  }
}
