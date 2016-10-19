export default function() {

  this.namespace = 'api';
  this.timing = 400;

  this.get('/geo-objects', (schema) => {
    return schema.geoObjects.all();
  });
}
