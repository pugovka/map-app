export default function() {

  this.namespace = '';
  this.timing = 400;

  this.get('/geo-objects', (schema) => {
    return schema.geoObjects.all();
  });
}
