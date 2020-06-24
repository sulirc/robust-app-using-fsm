import fetchJsonp from 'fetch-jsonp';

export function fetchPhotosByTags(tags) {
  fetchJsonp(
    `https://api.flickr.com/services/feeds/photos_public.gne?lang=en-us&format=json&tags=${tags}`,
    { jsonpCallback: 'jsoncallback' })
    .then(res => res.json())
}