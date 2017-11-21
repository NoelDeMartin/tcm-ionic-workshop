import {
    Input,
    Component,
} from '@angular/core';

@Component({
    selector: 'page',
    templateUrl: 'page.html'
})
export class Page {

    @Input() title: string = 'TCMChat';

}