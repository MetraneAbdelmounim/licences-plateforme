import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { LoginService } from '../services/login.service';
import { Router } from '@angular/router';
import { MemberService } from '../services/member.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  // @ts-ignore
  private authListenerSub : Subscription;
  memberIsAuthenticated : boolean = false;
  // @ts-ignore
  private userId : string;
  // @ts-ignore
  username: string;
  // @ts-ignore
  
  memberConnected : any
// @ts-ignore
  role:string

  constructor(private loginService:LoginService,private router :Router,private memberService: MemberService) { }

  ngOnInit(): void {

    this.memberIsAuthenticated = this.loginService.getAuthStatus();
    this.authListenerSub = this.loginService.getAuthStatusListener()
      .subscribe((isAuthenticated)=> {
        this.memberIsAuthenticated = isAuthenticated;
        if(this.memberIsAuthenticated){
          this.memberService.getMemberFromToken(this.loginService.getToken())
          this.memberService.userFromTokenSubject.asObservable().subscribe((connectedMember:any)=>{

            this.memberConnected=connectedMember
            this.role= connectedMember.member.isAdmin?'Admin':'User';
         
            
        this.username = connectedMember.member.username.split("@")[0].split(".")[0].toUpperCase()+" "+connectedMember.member.username.split("@")[0].split(".")[1].toUpperCase();
            
            this.userId = connectedMember.member.userId;
          })

        }


      });

    this.memberIsAuthenticated = this.loginService.getAuthStatus();
    if(this.memberIsAuthenticated) {
      this.memberService.getMemberFromToken(this.loginService.getToken())
      this.memberService.userFromTokenSubject.asObservable().subscribe((connectedMember:any)=>{

        
        this.memberConnected=connectedMember
        this.role= connectedMember.member.isAdmin?'Admin':'User';
        this.username = connectedMember.member.username.split("@")[0].split(".")[0].toUpperCase()+" "+connectedMember.member.username.split("@")[0].split(".")[1].toUpperCase();

        this.userId = connectedMember.member.userId;
      })
    }
  }

  onLogout() {
    this.isUserMenuOpen = false;
    this.loginService.logout()
  }

  isActive(services: string) {
    return this.router.url=='/'+services
  }

  isAdmin(admin: string) {
    return this.router.url.startsWith('/'+admin)
  }
  home(){

    this.router.navigate(['/clients'])
    
  }
  globalVue(){

    this.router.navigate(['/global-vue'])
    
  }
  isUserMenuOpen = false;

  @ViewChild('userMenu') userMenu!: ElementRef;

  toggleUserMenu(event: Event) {
    event.stopPropagation(); // empêche fermeture immédiate
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }
  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (
      this.isUserMenuOpen &&
      this.userMenu &&
      !this.userMenu.nativeElement.contains(event.target)
    ) {
      this.isUserMenuOpen = false;
    }
  }



}