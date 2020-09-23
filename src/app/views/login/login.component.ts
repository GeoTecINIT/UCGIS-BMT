import { Component, NgZone, OnInit, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import {UserService} from '../../services/user.service';
import { DefaultLayoutComponent } from '../../containers/default-layout';

@Component({
  selector: 'app-dashboard',
  templateUrl: 'login.component.html',
})
export class LoginComponent implements OnInit {

  public email: string;
  public pwd: string;
  public errorLogin: string;
  public errorRegister: string;
  public emailRegister: string;
  public pwdRegister: string;
  public pwdRepRegister: string;
  public isRegistering = false;
  return = 'list';

  constructor(
    private afAuth: AngularFireAuth,
    private ngZone: NgZone,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: BsModalService,
  ) {
    this.email = '';
    this.pwd = '';
    this.afAuth.auth.onAuthStateChanged(user => {
      if (user && !user.isAnonymous) {
        this.ngZone.run(() => this.router.navigateByUrl(this.return)).then();
         // Close modal after register & google login
          for (let i = 1; i <= this.modalService.getModalsCount(); i++) {
            this.modalService.hide(i);
          }
          const element = document.getElementsByTagName('body');
          element[0].classList.remove('modal-open');
      }
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => this.return = params['return'] || '/newmatch/empty');
    if (this.afAuth.auth.currentUser && !this.afAuth.auth.currentUser.isAnonymous) {
      this.ngZone.run(() => this.router.navigateByUrl(this.return)).then();
    }
  }

  login() {
    this.afAuth.auth.signInWithEmailAndPassword(this.email, this.pwd)
      .catch(error => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        this.errorLogin = errorMessage;
        console.log(errorCode + ' - ' + errorMessage);
      });
    this.route.queryParams.subscribe(params => this.return = params['return'] || '/newmatch/empty');
    if (this.afAuth.auth.currentUser && !this.afAuth.auth.currentUser.isAnonymous) {
      this.ngZone.run(() => this.router.navigateByUrl(this.return)).then();
    }
      for (let i = 1; i <= this.modalService.getModalsCount(); i++) {
        this.modalService.hide(i);
      }
    const element = document.getElementsByTagName('body');
    element[0].classList.remove('modal-open');
  }

  loginWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();

    this.afAuth.auth.signInWithPopup(provider).then(result => {
      // This gives you a Google Access Token. You can use it to access the Google API.
     /* if (result.additionalUserInfo.isNewUser) {
        // deletes and signout user
        this.afAuth.auth.currentUser.delete();
      }*/
      const token = result.credential;
      // The signed-in user info.
      const user = result.user;

      // ...
    }).catch(error => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      this.errorLogin = errorMessage;
      console.log(errorCode + ' - ' + errorMessage);
    });
  }

  logout() {
    this.afAuth.auth.signOut();
  }

  register() {
    if (this.pwdRegister === this.pwdRepRegister) {
      this.afAuth.auth.createUserWithEmailAndPassword(this.emailRegister, this.pwdRegister)
        .catch(error => {
          // Handle Errors here.
          const errorCode = error.code;
          const errorMessage = error.message;
          this.errorRegister = errorMessage;
          console.log(errorCode + ' - ' + errorMessage);
        });
    } else {
      this.errorRegister = 'Your passwords are not equal';
    }
  }

  forgotPwd() {
    const actionCodeSettings = {
      url: 'https://ocuprotool.web.app/#/login', // the domain has to be added to firebase console whitelist
      handleCodeInApp: false
    };

    this.afAuth.auth.sendPasswordResetEmail(this.email, actionCodeSettings)
      .then(() => {
        // Password reset email sent.
        this.errorLogin = 'An email has been sent to your address. It contains a link to recover your password.';
      })
      .catch(error => {
        // Error occurred. Inspect error.code.
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        this.errorLogin = errorMessage;
        console.log(errorCode + ' - ' + errorMessage);
      });
  }

}

