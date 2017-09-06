import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map'
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

  constructor(public geolocation: Geolocation,
              public http: Http, platform: Platform,
              private launchNavigator: LaunchNavigator) {
    this.platform = platform;

  }


  openGps() {
    let destination = this.lat + ',' + this.lng;

    this.launchNavigator.navigate(destination);
  }

  doRefresh(e) {
    this.searchCook();
    setTimeout(() => {
      e.complete();
    }, 2000);
  }

  getPos() {
    this.search = true;
    this.geolocation.getCurrentPosition().then((position) => {
      this.myLat = position.coords.latitude;
      this.myLng = position.coords.longitude;
      this.searchCook();
      return true;
    }, (err) => {
      console.log(err);
    });
  }

  searchCook() {
    this.http.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + this.myLat + ',' + this.myLng + '&radius=200&type=restaurant&key=' + this.token).map(res => res.json()).subscribe(data => {

      let resultCook = data.results[Math.floor(Math.random() * data.results.length)];

      this.http.get('https://maps.googleapis.com/maps/api/place/details/json?placeid=' + resultCook.place_id + '&key=' + this.token).map(res => res.json()).subscribe(data2 => {

        resultCook = data2.result;
        this.lat = resultCook.geometry.location.lat;
        this.lng = resultCook.geometry.location.lng;

        this.http.get('https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=' + this.myLat + ',' + this.myLng + '&destinations=' + resultCook.geometry.location.lat + ',' + resultCook.geometry.location.lng + '&key=AIzaSyBR9qbn52JXC_AKne3F01Z2JjeKCYpcB64').map(res => res.json()).subscribe(data3 => {
          this.distance = data3.rows[0].elements[0].distance.value;
        })

        if (resultCook.photos) {
          this.http.get('https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=' + resultCook.photos[0].photo_reference + '&key=' + this.token).map(res => res).subscribe(data => {
            this.search = false;
            this.result = {result: resultCook, image: data.url}
          })
        }
        else {
          this.search = false;
          this.result = {result: resultCook}
        }
        return true;
      })
    });
  }

}
