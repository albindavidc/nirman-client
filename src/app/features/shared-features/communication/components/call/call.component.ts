import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { WebRtcService } from '../../services/webrtc.service';
import { SocketService } from '../../../../../core/services/socket.service';
import { CommunicationService } from '../../services/communication.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-call',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './call.component.html',
  styleUrls: ['./call.component.scss']
})
export class CallComponent implements OnInit, OnDestroy {
  @Input() chat: any;
  @Input() callType: 'audio' | 'video' = 'audio';
  @Input() callId: string | null = null;
  @Input() isInitiator: boolean = false;
  @Input() targetUserId: string | null = null;
  @Output() onEndCall = new EventEmitter<void>();

  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;

  private webRtcService = inject(WebRtcService);
  private socketService = inject(SocketService);
  private commService = inject(CommunicationService);
  
  callDuration: string = '00:00';
  isMuted: boolean = false;
  isVideoOff: boolean = false;

  private timer: any;
  private seconds: number = 0;
  private subs = new Subscription();

  async ngOnInit() {
    this.startTimer();
    this.isVideoOff = this.callType === 'audio';
    
    await this.setupWebRtc();
    this.setupSignaling();

    if (this.isInitiator) {
      await this.initiateCall();
    }
  }

  ngOnDestroy() {
    this.cleanup();
  }

  private async setupWebRtc() {
    const stream = await this.webRtcService.getLocalStream(this.callType);
    this.localVideo.nativeElement.srcObject = stream;

    this.subs.add(
      this.webRtcService.getRemoteStream().subscribe(remoteStream => {
        if (remoteStream && this.remoteVideo) {
          this.remoteVideo.nativeElement.srcObject = remoteStream;
        }
      })
    );

    this.subs.add(
      this.webRtcService.iceCandidate$.subscribe(candidate => {
        if (this.callId && this.targetUserId) {
          this.socketService.sendIceCandidate({
            callId: this.callId,
            candidate,
            targetUserId: this.targetUserId
          });
        }
      })
    );
  }

  private setupSignaling() {
    this.subs.add(
      this.socketService.onCallOffer().subscribe(async (data) => {
        if (data.callId === this.callId) {
          const answer = await this.webRtcService.handleOffer(data.offer);
          this.socketService.answerCall({
            callId: this.callId!,
            answer,
            targetUserId: this.targetUserId!
          });
        }
      })
    );

    this.subs.add(
      this.socketService.onCallAnswer().subscribe(async (data) => {
        if (data.callId === this.callId) {
          await this.webRtcService.handleAnswer(data.answer);
        }
      })
    );

    this.subs.add(
      this.socketService.onIceCandidate().subscribe(async (data) => {
        if (data.callId === this.callId) {
          await this.webRtcService.addIceCandidate(data.candidate);
        }
      })
    );

    this.subs.add(
      this.socketService.onCallEnded().subscribe((data) => {
        if (data.callId === this.callId) {
          this.onEndCall.emit();
        }
      })
    );
  }

  private async initiateCall() {
    if (!this.callId || !this.targetUserId) return;
    
    const offer = await this.webRtcService.createOffer();
    this.socketService.offerCall({
      callId: this.callId,
      offer,
      targetUserId: this.targetUserId
    });
  }

  private startTimer() {
    this.timer = setInterval(() => {
      this.seconds++;
      const m = Math.floor(this.seconds / 60).toString().padStart(2, '0');
      const s = (this.seconds % 60).toString().padStart(2, '0');
      this.callDuration = `${m}:${s}`;
    }, 1000);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.localVideo.nativeElement.srcObject) {
      const stream = this.localVideo.nativeElement.srcObject as MediaStream;
      stream.getAudioTracks().forEach(track => track.enabled = !this.isMuted);
    }
  }

  toggleVideo() {
    this.isVideoOff = !this.isVideoOff;
    if (this.localVideo.nativeElement.srcObject) {
      const stream = this.localVideo.nativeElement.srcObject as MediaStream;
      stream.getVideoTracks().forEach(track => track.enabled = !this.isVideoOff);
    }
  }

  async endCall() {
    if (this.callId) {
      this.socketService.endCall(this.callId, this.targetUserId || undefined);
      this.commService.updateCallStatus(this.callId, 'ended').subscribe();
    }
    this.onEndCall.emit();
  }

  private cleanup() {
    clearInterval(this.timer);
    this.subs.unsubscribe();
    this.webRtcService.hangUp();
  }
}
