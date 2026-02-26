import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage {

  nombre = '';
  email = '';
  telefono = '';
  password = '';
  password2 = '';

  loading = false;
  error = '';
  okMsg = '';

  // ✅ NUEVO: switch rol (false=user, true=driver)
  isDriver = false;

  // Foto perfil
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;
  selectedFile: File | null = null;
  photoPreview: string | null = null; // dataURL o webPath

  constructor(
    private router: Router,
    private auth: AuthService
  ) { }

  pickFromGallery() {
    this.fileInput?.nativeElement?.click();
  }

  // ✅ FIX MINIMO: el HTML llama a openFilePicker(), así que lo creamos como alias
  openFilePicker() {
    this.pickFromGallery();
  }

  async takePhoto() {
    try {
      const photo = await Camera.getPhoto({
        quality: 70,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });

      if (!photo?.webPath) return;

      // Convertimos webPath -> File
      const blob = await fetch(photo.webPath).then(r => r.blob());
      const ext = blob.type?.split('/')[1] || 'jpg';
      const file = new File([blob], `profile_${Date.now()}.${ext}`, { type: blob.type || 'image/jpeg' });

      this.selectedFile = file;
      this.photoPreview = photo.webPath;
    } catch (e) {
      // Si el usuario cancela cámara, no hacemos nada.
    }
  }

  onFileSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.selectedFile = file;

    // Preview
    const reader = new FileReader();
    reader.onload = () => {
      this.photoPreview = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  }

  removePhoto() {
    this.selectedFile = null;
    this.photoPreview = null;
    if (this.fileInput?.nativeElement) this.fileInput.nativeElement.value = '';
  }

  doRegister() {
    this.error = '';
    this.okMsg = '';

    const nombre = this.nombre.trim();
    const email = this.email.trim();
    const telefono = this.telefono.trim();

    if (!nombre) return this.fail('El nombre es obligatorio.');
    if (!email) return this.fail('El email es obligatorio.');
    if (!this.isValidEmail(email)) return this.fail('El email no tiene un formato válido.');
    if (!telefono) return this.fail('El teléfono es obligatorio.');
    if (!this.password) return this.fail('La contraseña es obligatoria.');
    if (this.password.length < 4) return this.fail('La contraseña debe tener al menos 4 caracteres.');
    if (this.password !== this.password2) return this.fail('Las contraseñas no coinciden.');

    this.loading = true;

    // multipart/form-data
    const form = new FormData();
    form.append('nombre', nombre);
    form.append('email', email);
    form.append('telefono', telefono);
    form.append('password', this.password);

    // ✅ NUEVO: rol
    form.append('rol', this.isDriver ? 'driver' : 'user');

    // campo archivo: img_profile
    if (this.selectedFile) {
      form.append('img_profile', this.selectedFile, this.selectedFile.name);
  
    }

    // ✅ MISMO endpoint (recomendado si tu backend acepta "rol")
    this.auth.registerUsuario(form).subscribe({
      next: () => {
        this.okMsg = 'Cuenta creada. Ya puedes iniciar sesión.';
        this.loading = false;

        setTimeout(() => {
          this.router.navigateByUrl('/login');
        }, 700);
      },
      error: (e) => {
        this.loading = false;
        this.error = e?.error?.message || 'No se pudo registrar el usuario.';
      }
    });

    // ✅ Si tu backend tiene endpoint separado, cambia a esto:
    // const req$ = this.isDriver ? this.auth.registerDriver(form) : this.auth.registerUsuario(form);
    // req$.subscribe({
    //   next: () => { ... },
    //   error: (e) => { ... }
    // });
    console.log('isDriver=', this.isDriver);
  }

  goLogin() {
    this.router.navigateByUrl('/login');
  }

  private fail(msg: string) {
    this.error = msg;
  }

  private isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}