import { BrowserModule } from '@angular/platform-browser';
import { NgModule, PLATFORM_ID, NgZone } from '@angular/core';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { NgSelectModule, NgOption } from '@ng-select/ng-select';
import { FormsModule, FormBuilder, Validator } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Import firebase-firestore
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireAuthGuard } from '@angular/fire/auth-guard';
import { AngularFireAnalyticsModule, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { AngularFirePerformanceModule } from '@angular/fire/performance';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireStorageModule } from '@angular/fire/storage';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

import { AppComponent } from './app.component';
import { environment } from '../environments/environment';

// Import containers
import { DefaultLayoutComponent } from './containers';

import { P404Component } from './views/error/404.component';
import { P500Component } from './views/error/500.component';
import { LoginComponent } from './views/login/login.component';
import { UserComponent } from './views/user/user.component';
import { OrganizationComponent } from './views/organization/organization.component';
import { ListComponent } from './views/list/list.component';

import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { ReleaseNotesComponent } from './components/release-notes/release-notes.component';
import { FaqComponent } from './components/faq/faq.component';


const APP_CONTAINERS = [DefaultLayoutComponent];

import {
  AppAsideModule,
  AppBreadcrumbModule,
  AppHeaderModule,
  AppFooterModule,
  AppSidebarModule
} from '@coreui/angular';

// Import routing module
import { AppRoutingModule } from './app.routing';

// Import 3rd party components
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { DetailComponent } from './views/detail/detail.component';
import { LoadingIndicatorComponent } from './components/loading-indicator/loading-indicator.component';
import { PopoverModule } from 'ngx-bootstrap/popover';

// Custom Pipes
import { TruncatePipe } from './pipes/truncate.pipe';
import { HighlightPipe } from './pipes/highlight.pipe';

import { PopupComponent } from './components/popup/popup.component';
import { Base64img } from './components/popup/base64img';

import { ModalModule } from 'ngx-bootstrap/modal';
import { Eo4geoFooterComponent } from './components/eo4geo-footer/eo4geo-footer.component';
import { Eo4geoHeaderComponent } from './components/eo4geo-header/eo4geo-header.component';
import { NewmatchComponent } from './views/newmatch/newmatch.component';


@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    AppAsideModule,
    AppBreadcrumbModule.forRoot(),
    AppFooterModule,
    AppHeaderModule,
    AppSidebarModule,
    PerfectScrollbarModule,
    BsDropdownModule.forRoot(),
    TabsModule.forRoot(),
    ChartsModule,
    TooltipModule.forRoot(),
    NgSelectModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireAnalyticsModule,
    AngularFirePerformanceModule,
    AngularFireDatabaseModule,
    AngularFireStorageModule,
    HttpClientModule,
    PopoverModule.forRoot(),
    ModalModule.forRoot()
  ],
  declarations: [
    AppComponent,
    ...APP_CONTAINERS,
    P404Component,
    P500Component,
    LoginComponent,
    UserComponent,
    OrganizationComponent,
    ListComponent,
    DetailComponent,
    LoadingIndicatorComponent,
    TruncatePipe,
    HighlightPipe,
    PopupComponent,
    Eo4geoFooterComponent,
    Eo4geoHeaderComponent,
    NewmatchComponent,
    ReleaseNotesComponent,
    FaqComponent
  ],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    AngularFireAuthGuard,
    Base64img,
    FormBuilder,
    ScreenTrackingService, // automatically integrates with the Angular Router to provide Firebase with screen view tracking
    UserTrackingService // dynamically import firebase/auth, monitor for changes in the logged in user
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
