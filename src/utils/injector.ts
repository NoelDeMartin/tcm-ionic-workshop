import { Injector } from '@angular/core';

let injector: Injector;

export function resolveDependency(dependency: any): any {
    return injector.get(dependency);
}

export function registerInjector(rootInjector: Injector) {

    return function() {
        injector = rootInjector;
    };

}