import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map'


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

  constructor(public navCtrl: NavController, public geolocation: Geolocation, public http: Http) {}

  searchCook() {
    this.search = true;


    this.geolocation.getCurrentPosition().then((position) => {

      console.log(position.coords.latitude, position.coords.longitude);

      this.http.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+position.coords.latitude+','+ position.coords.longitude +'&radius=900&type=restaurant&key='+this.token).map(res => res.json()).subscribe(data => {

        let resultCook = data.results[Math.floor(Math.random()*data.results.length)];

        this.http.get('https://maps.googleapis.com/maps/api/place/details/json?placeid='+resultCook.place_id+'&key='+this.token).map(res => res.json()).subscribe(data2 => {

          resultCook = data2.result;
          console.log(resultCook);

          this.http.get('https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins='+position.coords.latitude+','+ position.coords.longitude +'&destinations='+resultCook.geometry.location.lat+','+ resultCook.geometry.location.lng +'&key=AIzaSyBR9qbn52JXC_AKne3F01Z2JjeKCYpcB64').map(res => res.json()).subscribe(data3 => {
            this.distance = data3.rows[0].elements[0].distance.value;
          })

          if(resultCook.photos) {
            console.log(resultCook.photos[0].photo_reference);
            this.http.get('https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=' + resultCook.photos[0].photo_reference + '&key='+this.token).map(res => res).subscribe(data => {
              console.log(data.url);
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
