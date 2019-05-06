import { ActionCreator, Creator } from '@ngrx/store';
import { TypedAction } from 'modules/store/src/models';
import { Observable, OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';
import { Actions, ofType } from './actions';
import { createEffect } from './effect_creator';
import { mapToAction } from './temp-map-to-action';

export interface CreateApiEffectConfig<T> {
  actionStream: Actions;
  ofType:
    | string
    | ActionCreator<string, Creator>
    | Array<string | ActionCreator<string, Creator>>;
  apiStream: (props: any) => Observable<T>;
  onSuccess: (payload: T) => TypedAction<string>;
  onFailure: (error: string) => TypedAction<string>;
  operator?: <InputAction, OutputAction>(
    project: (input: InputAction, index: number) => Observable<OutputAction>
  ) => OperatorFunction<InputAction, OutputAction>;
}

export function createApiEffect<T>(config: CreateApiEffectConfig<T>) {
  const sourceActions = Array.isArray(config.ofType)
    ? config.ofType
    : [config.ofType];

  return createEffect(() =>
    config.actionStream.pipe(
      ofType(...sourceActions),
      mapToAction({
        project: props =>
          config.apiStream(props).pipe(map(items => config.onSuccess(items))),
        error: error => config.onFailure(error),
        operator: config.operator,
      })
    )
  );
}
