import { Component, Input, Output, EventEmitter } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-move-file-modal',
  templateUrl: './move-file-modal.component.html',
  styleUrls: ['./move-file-modal.component.scss']
})
export class MoveFileModalComponent {
  @Input() folders: any[] = [];
  @Input() show = false;
  @Input() currentFolderId: number | null = null;
  @Input() fileToMove: any;

  @Output() close = new EventEmitter<void>();
  @Output() move = new EventEmitter<number | null>();

  selectedFolderId: number | null = null;

  ngOnInit() {
    this.selectedFolderId = this.currentFolderId;
  }

  confirmMove() {
    if (this.selectedFolderId !== this.fileToMove?.folder_id) {
      this.move.emit(this.selectedFolderId ?? null);
    }
    Swal.fire({
      toast: true,
      position: 'top',
      background: 'transparent',
      icon: 'success',
      showConfirmButton: false,
      timer: 3000,
      customClass: {
        popup: 'custom-toast'
      }
    });
    this.close.emit();
  }

  selectFolder(folderId: number | null) {
    if (this.fileToMove?.folder_id === folderId) {
      return;
    }
    this.selectedFolderId = folderId;
  }
  
  canSelectFolder(folderId: number | null): boolean {
    return this.fileToMove?.folder_id !== folderId;
  }
}
