import Rdf from './rdf_handler';
import { Iri, Label, Triple } from './aliases';
import { Voyage } from './models';

export default class Scanner {
  static scan(): void {
    // Get Voyages
    const voyages: Voyage[] = Rdf.get.voyages();
  }
}
