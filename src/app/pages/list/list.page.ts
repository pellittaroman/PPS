import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { TextService } from 'src/app/services/text.service';
import { ToastService } from 'src/app/services/toast.service';
import { Text } from 'src/app/models/text';
import { TipoLista } from 'src/app/models/enums/tipo-lista.enum';
import { AuthService } from 'src/app/services/auth.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss']
})
export class ListPage implements AfterViewInit {
  title: string;
  tipoLista: TipoLista;
  allMessages: Text[];
  currentUserId: string;
  form: FormGroup;
  colores: string[] = ['primary', 'secondary', 'tertiary', 'success', 'danger', 'warning'];
  userMail: string;
  @ViewChild(IonContent) content: IonContent;

  constructor(
    private router: Router,
    private textService: TextService,
    private toastService: ToastService,
    private authService: AuthService,
    private formBuilder: FormBuilder
  ) {
    this.form = this.formBuilder.group({
      text: new FormControl('', Validators.required)
    });

    console.log(this.router.url);
    if (this.router.url === '/list/cosasLindas') {
      this.tipoLista = TipoLista.A;
      this.title = 'Chat - PPS - 4toA';
    } else {
      this.tipoLista = TipoLista.B;
      this.title = 'Chat - PPS - 4toB';
    }
    console.log(this.tipoLista);
    this.textService.GetAlltextsByType(this.tipoLista).subscribe(texts => {
      this.allMessages = texts;
      this.iniciarColores();
      console.log(this.allMessages);
      setTimeout(() => {
         this.content.scrollToBottom(0);
      }, 100);
    });
    this.currentUserId = this.authService.getCurrentUserId();
    this.userMail = this.authService.getCurrentUserMail();
    console.log(this.currentUserId);
  }

  ngAfterViewInit(): void {
  }

  private iniciarColores() {
    let contador = 0;
    this.allMessages.forEach( message => {
      let flag = false;
      const color = this.colores[contador];
      this.allMessages.forEach(message2 => {
        if (message.uid === message2.uid && !message2.color) {
          message2.color = color;
          flag = true;
        }
      });
      if (flag) {
        contador++;
      }
    });
  }

  onSubmitSendMessage() {
    const text: Text = new Text();
    text.division = this.tipoLista;
    text.uid = this.currentUserId;
    text.umail = this.authService.getCurrentUserMail();
    text.uname = text.umail.split('@')[0];
    text.text = this.form.get('text').value;
    text.fecha = new Date().getTime();
    this.textService
      .save(text)
      .then(() => {
        this.form.get('text').setValue('');
      })
      .catch(error => {
        this.toastService.errorToast(
          'Error: No se ha podido guardar el mensaje. ' + error.message
        );
      });
  }

  onLogout() {
    this.authService.logout();
  }
}
