import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { AlertifyService } from '../_services/alertify.service';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { User } from '../_models/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  @Output() cancelRegister = new EventEmitter();
  user: User;
  registerForm: FormGroup;
  bsConfig: Partial<BsDatepickerConfig>;

  gendersOptions = [
    'Female',
    'Male',
    'Non-binary',
    'Transgender',
    'Prefer not to say',
    'Let me type'
  ];

  constructor(
    private authService: AuthService,
    private alertify: AlertifyService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    this.bsConfig = {
      containerClass: 'theme-red'
    },
    this.createRegisterForm();
  }

  createRegisterForm() {
    this.registerForm = this.fb.group({
      gender: [''],
      genderOption: ['', Validators.required],
      username: ['', Validators.required],
      knownAs: ['', Validators.required],
      dateOfBirth: [null, Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      preferences: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(8),]],
      confirmPassword: ['', Validators.required]
    }, {validators: [this.passwordMatchValidator, this.typedGenderValidator]});
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password').value === g.get('confirmPassword').value ? null : {mismatch: true};
  }

  typedGenderValidator(g: FormGroup) {
    return (g.get('genderOption').value === 'Let me type' && g.get('gender').value !== '')
      || g.get('genderOption').value !== 'Let me type' ? null : {missingGender: true};
  }

  register() {
    if (this.registerForm.get('genderOption').value !== 'Let me type') {
      this.registerForm.get('gender').setValue(this.registerForm.get('genderOption').value);
    }
    if (this.registerForm.valid){
      const clone = Object.assign({}, this.registerForm.value);
      delete clone.genderOption;
      this.user = clone;
      this.authService.register(this.user).subscribe(() => {
        this.alertify.success('Registration successful');
      }, error => {
        this.alertify.error(error);
      }, () => {
        this.authService.login(this.user).subscribe(() => {
          this.router.navigate(['/members']);
        });
      });
    }
  }

  cancel() {
    this.cancelRegister.emit(false);
  }
}
