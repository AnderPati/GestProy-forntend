import { Component, AfterViewInit, ElementRef, HostListener, ViewChild } from '@angular/core';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements AfterViewInit {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  currentImage: string = 'assets/img/gestproy_logo_isotipo_bgless.png';
  private boundScrollHandler: any;
  imageOpacityClass: string = ''; // Para controlar la animación
  isAnimating = false;

  ngAfterViewInit(): void {
    this.boundScrollHandler = this.onScroll.bind(this);
    this.scrollContainer.nativeElement.addEventListener('scroll', this.boundScrollHandler);
  }

  ngOnDestroy(): void {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.removeEventListener('scroll', this.boundScrollHandler);
    }
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    const sections = this.scrollContainer.nativeElement.querySelectorAll('.slide');
    let current: HTMLElement | null = null;

    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
        current = section as HTMLElement;
        break;
      }
    }

    if (current) {
      const newImage = current.dataset['img'];
      if (newImage && newImage !== this.currentImage && !this.isAnimating) {
        this.isAnimating = true;
        this.imageOpacityClass = 'fade-out';
        
        setTimeout(() => {
          this.currentImage = newImage!;
          this.imageOpacityClass = 'fade-in';
          
          // Espera que termine fade-in antes de desbloquear
          setTimeout(() => {
            this.imageOpacityClass = '';
            this.isAnimating = false;
          }, 300); // Duración de fade-in
        }, 300); // Duración de fade-out
      }
    }
  }
}
