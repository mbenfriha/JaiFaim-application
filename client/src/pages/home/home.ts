import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map'
import { StatusBar } from '@ionic-native/status-bar';
import { LaunchNavigator } from '@ionic-native/launch-navigator';

declare var google;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  search = false;
  result;
  token = 'AIzaSyDqBpVM6Gu5rPSQ9xnExkBJGEr4YcpoI6c';
  distance = 0;
  lat: number = 0;
  lng: number = 0;
  myLat: number = 0;
  myLng: number = 0;
  private platform:Platform = null;

  image = "http://www.freeiconspng.com/uploads/map-navigation-pin-point-restaurant-icon--14.png";
  constructor(public navCtrl: NavController, public geolocation: Geolocation, public http: Http, platform: Platform, private statusBar: StatusBar, private launchNavigator: LaunchNavigator) {
    this.platform = platform;

  }


  openGps() {
    console.log('gps');
    let destination = this.lat + ',' + this.lng;

    this.launchNavigator.navigate(destination);

    /*if(this.platform.is('ios')){
      window.open('maps://?q=' + destination, '_system');
    } else {
      let label = encodeURI('My Label');
      window.open('geo:0,0?q=' + destination + '(' + label + ')', '_system');
    }*/
  }

  searchCook() {
    this.search = true;

    this.geolocation.getCurrentPosition().then((position) => {
      this.myLat = position.coords.latitude;
      this.myLng = position.coords.longitude;
      this.http.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+this.myLat+','+ this.myLng+'&radius=200&type=restaurant&key='+this.token).map(res => res.json()).subscribe(data => {

        let resultCook = data.results[Math.floor(Math.random()*data.results.length)];

        this.http.get('https://maps.googleapis.com/maps/api/place/details/json?placeid='+resultCook.place_id+'&key='+this.token).map(res => res.json()).subscribe(data2 => {

          resultCook = data2.result;
          console.log(resultCook);
          this.lat = resultCook.geometry.location.lat;
          this.lng = resultCook.geometry.location.lng;
          console.log(this.lat, this.lng);

          this.http.get('https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins='+position.coords.latitude+','+ position.coords.longitude +'&destinations='+resultCook.geometry.location.lat+','+ resultCook.geometry.location.lng +'&key=AIzaSyBR9qbn52JXC_AKne3F01Z2JjeKCYpcB64').map(res => res.json()).subscribe(data3 => {
            this.distance = data3.rows[0].elements[0].distance.value;
          })

          if(resultCook.photos) {
            this.http.get('https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=' + resultCook.photos[0].photo_reference + '&key='+this.token).map(res => res).subscribe(data => {
              this.search = false;
              this.result = {result: resultCook, image: data.url}
            })
          }
          else {
            this.search = false;
            this.result = {result: resultCook}
          }
        })
      });
    }, (err) => {
      console.log(err);
    });
  }

}
