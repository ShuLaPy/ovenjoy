import type OvenjoyRequest from 'lib/request';
import type OvenjoyResponse from 'lib/response';

const query = (req: OvenjoyRequest, res: OvenjoyResponse, next: any) => {
  // Sample URL with query parameters
  const urlString = req.url;

  // Create a URL object from the URL string
  const url = new URL(urlString);

  // Get the search parameters (query parameters) from the URL
  const searchParams = url.searchParams;

  // Convert searchParams to a JavaScript object
  const queryParams: any = {};
  searchParams.forEach((value, key) => {
    if (queryParams[key]) {
      if (Array.isArray(queryParams[key])) {
        queryParams[key].push(value);
      } else {
        queryParams[key] = [queryParams[key], value];
      }
    } else {
      queryParams[key] = value;
    }
  });

  req.query = queryParams;

  next();
};

export default query;
