/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Event } from 'vs/base/common/event';
import Severity from 'vs/base/common/severity';
import { URI } from 'vs/base/common/uri';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { IExtensionPoint } from 'vs/workbench/services/extensions/common/extensionsRegistry';
import { ExtensionIdentifier, IExtension, ExtensionType, IExtensionDescription, IExtensionContributions, TargetPlatform } from 'vs/platform/extensions/common/extensions';
import { getExtensionId, getGalleryExtensionId } from 'vs/platform/extensionManagement/common/extensionManagementUtil';
import { IMessagePassingProtocol } from 'vs/base/parts/ipc/common/ipc';
import { ApiProposalName } from 'vs/workbench/services/extensions/common/extensionsApiProposals';
import { IV8Profile } from 'vs/platform/profiling/common/profiling';
import { ExtensionDescriptionRegistry } from 'vs/workbench/services/extensions/common/extensionDescriptionRegistry';

export const nullExtensionDescription = Object.freeze<IExtensionDescription>({
	identifier: new ExtensionIdentifier('nullExtensionDescription'),
	name: 'Null Extension Description',
	version: '0.0.0',
	publisher: 'vscode',
	engines: { vscode: '' },
	extensionLocation: URI.parse('void:location'),
	isBuiltin: false,
	targetPlatform: TargetPlatform.UNDEFINED,
	isUserBuiltin: false,
	isUnderDevelopment: false,
});

export type WebWorkerExtHostConfigValue = boolean | 'auto';
export const webWorkerExtHostConfig = 'extensions.webWorker';

export const IExtensionService = createDecorator<IExtensionService>('extensionService');

export interface IMessage {
	type: Severity;
	message: string;
	extensionId: ExtensionIdentifier;
	extensionPointId: string;
}

export class LocalProcessRunningLocation {
	public readonly kind = ExtensionHostKind.LocalProcess;
	constructor(
		public readonly affinity: number
	) { }
	public equals(other: ExtensionRunningLocation) {
		return (this.kind === other.kind && this.affinity === other.affinity);
	}
	public asString(): string {
		if (this.affinity === 0) {
			return 'LocalProcess';
		}
		return `LocalProcess${this.affinity}`;
	}
}
export class LocalWebWorkerRunningLocation {
	public readonly kind = ExtensionHostKind.LocalWebWorker;
	public readonly affinity = 0;
	public equals(other: ExtensionRunningLocation) {
		return (this.kind === other.kind);
	}
	public asString(): string {
		return 'LocalWebWorker';
	}
}
export class RemoteRunningLocation {
	public readonly kind = ExtensionHostKind.Remote;
	public readonly affinity = 0;
	public equals(other: ExtensionRunningLocation) {
		return (this.kind === other.kind);
	}
	public asString(): string {
		return 'Remote';
	}
}
export type ExtensionRunningLocation = LocalProcessRunningLocation | LocalWebWorkerRunningLocation | RemoteRunningLocation;

export interface IExtensionsStatus {
	messages: IMessage[];
	activationTimes: ActivationTimes | undefined;
	runtimeErrors: Error[];
	runningLocation: ExtensionRunningLocation | null;
}

export class MissingExtensionDependency {
	constructor(readonly dependency: string) { }
}

/**
 * e.g.
 * ```
 * {
 *    startTime: 1511954813493000,
 *    endTime: 1511954835590000,
 *    deltas: [ 100, 1500, 123456, 1500, 100000 ],
 *    ids: [ 'idle', 'self', 'extension1', 'self', 'idle' ]
 * }
 * ```
 */
export interface IExtensionHostProfile {
	/**
	 * Profiling start timestamp in microseconds.
	 */
	startTime: number;
	/**
	 * Profiling end timestamp in microseconds.
	 */
	endTime: number;
	/**
	 * Duration of segment in microseconds.
	 */
	deltas: number[];
	/**
	 * Segment identifier: extension id or one of the four known strings.
	 */
	ids: ProfileSegmentId[];

	/**
	 * Get the information as a .cpuprofile.
	 */
	data: IV8Profile;

	/**
	 * Get the aggregated time per segmentId
	 */
	getAggregatedTimes(): Map<ProfileSegmentId, number>;
}

export const enum ExtensionHostKind {
	LocalProcess = 1,
	LocalWebWorker = 2,
	Remote = 3
}

export function extensionHostKindToString(kind: ExtensionHostKind | null): string {
	if (kind === null) {
		return 'None';
	}
	switch (kind) {
		case ExtensionHostKind.LocalProcess: return 'LocalProcess';
		case ExtensionHostKind.LocalWebWorker: return 'LocalWebWorker';
		case ExtensionHostKind.Remote: return 'Remote';
	}
}

export interface IExtensionHost {
	readonly runningLocation: ExtensionRunningLocation;
	readonly remoteAuthority: string | null;
	readonly lazyStart: boolean;
	/**
	 * A collection of extensions that will execute or are executing on this extension host.
	 * **NOTE**: this will reflect extensions correctly only after `start()` resolves.
	 */
	readonly extensions: ExtensionDescriptionRegistry;
	readonly onExit: Event<[number, string | null]>;

	start(): Promise<IMessagePassingProtocol> | null;
	getInspectPort(): number | undefined;
	enableInspectPort(): Promise<boolean>;
	dispose(): void;
}

export function isProposedApiEnabled(extension: IExtensionDescription, proposal: ApiProposalName): boolean {
	if (!extension.enabledApiProposals) {
		return false;
	}
	return extension.enabledApiProposals.includes(proposal);
}

export function checkProposedApiEnabled(extension: IExtensionDescription, proposal: ApiProposalName): void {
	if (!isProposedApiEnabled(extension, proposal)) {
		throw new Error(`Extension '${extension.identifier.value}' CANNOT use API proposal: ${proposal}.\nIts package.json#enabledApiProposals-property declares: ${extension.enabledApiProposals?.join(', ') ?? '[]'} but NOT ${proposal}.\n The missing proposal MUST be added and you must start in extension development mode or use the following command line switch: --enable-proposed-api ${extension.identifier.value}`);
	}
}


/**
 * Extension id or one of the four known program states.
 */
export type ProfileSegmentId = string | 'idle' | 'program' | 'gc' | 'self';

export interface ExtensionActivationReason {
	readonly startup: boolean;
	readonly extensionId: ExtensionIdentifier;
	readonly activationEvent: string;
}

export class ActivationTimes {
	constructor(
		public readonly codeLoadingTime: number,
		public readonly activateCallTime: number,
		public readonly activateResolvedTime: number,
		public readonly activationReason: ExtensionActivationReason
	) {
	}
}

export class ExtensionPointContribution<T> {
	readonly description: IExtensionDescription;
	readonly value: T;

	constructor(description: IExtensionDescription, value: T) {
		this.description = description;
		this.value = value;
	}
}

export const ExtensionHostLogFileName = 'exthost';

export interface IWillActivateEvent {
	readonly event: string;
	readonly activation: Promise<void>;
}

export interface IResponsiveStateChangeEvent {
	extensionHostId: string;
	extensionHostKind: ExtensionHostKind;
	isResponsive: boolean;
}

export const enum ActivationKind {
	Normal = 0,
	Immediate = 1
}

export interface IExtensionService {
	readonly _serviceBrand: undefined;

	/**
	 * An event emitted when extensions are registered after their extension points got handled.
	 *
	 * This event will also fire on startup to signal the installed extensions.
	 *
	 * @returns the extensions that got registered
	 */
	onDidRegisterExtensions: Event<void>;

	/**
	 * @event
	 * Fired when extensions status changes.
	 * The event contains the ids of the extensions that have changed.
	 */
	onDidChangeExtensionsStatus: Event<ExtensionIdentifier[]>;

	/**
	 * Fired when the available extensions change (i.e. when extensions are added or removed).
	 */
	onDidChangeExtensions: Event<void>;

	/**
	 * An event that is fired when activation happens.
	 */
	onWillActivateByEvent: Event<IWillActivateEvent>;

	/**
	 * An event that is fired when an extension host changes its
	 * responsive-state.
	 */
	onDidChangeResponsiveChange: Event<IResponsiveStateChangeEvent>;

	/**
	 * Send an activation event and activate interested extensions.
	 *
	 * This will wait for the normal startup of the extension host(s).
	 *
	 * In extraordinary circumstances, if the activation event needs to activate
	 * one or more extensions before the normal startup is finished, then you can use
	 * `ActivationKind.Immediate`. Please do not use this flag unless really necessary
	 * and you understand all consequences.
	 */
	activateByEvent(activationEvent: string, activationKind?: ActivationKind): Promise<void>;

	/**
	 * Determine if `activateByEvent(activationEvent)` has resolved already.
	 *
	 * i.e. the activation event is finished and all interested extensions are already active.
	 */
	activationEventIsDone(activationEvent: string): boolean;

	/**
	 * An promise that resolves when the installed extensions are registered after
	 * their extension points got handled.
	 */
	whenInstalledExtensionsRegistered(): Promise<boolean>;

	/**
	 * Return all registered extensions
	 */
	getExtensions(): Promise<IExtensionDescription[]>;

	/**
	 * Return a specific extension
	 * @param id An extension id
	 */
	getExtension(id: string): Promise<IExtensionDescription | undefined>;

	/**
	 * Returns `true` if the given extension can be added. Otherwise `false`.
	 * @param extension An extension
	 */
	canAddExtension(extension: IExtensionDescription): boolean;

	/**
	 * Returns `true` if the given extension can be removed. Otherwise `false`.
	 * @param extension An extension
	 */
	canRemoveExtension(extension: IExtensionDescription): boolean;

	/**
	 * Read all contributions to an extension point.
	 */
	readExtensionPointContributions<T extends IExtensionContributions[keyof IExtensionContributions]>(extPoint: IExtensionPoint<T>): Promise<ExtensionPointContribution<T>[]>;

	/**
	 * Get information about extensions status.
	 */
	getExtensionsStatus(): { [id: string]: IExtensionsStatus };

	/**
	 * Return the inspect port or `0` for a certain extension host.
	 * `0` means inspection is not possible.
	 */
	getInspectPort(extensionHostId: string, tryEnableInspector: boolean): Promise<number>;

	/**
	 * Return the inspect ports (if inspection is possible) for extension hosts of kind `extensionHostKind`.
	 */
	getInspectPorts(extensionHostKind: ExtensionHostKind, tryEnableInspector: boolean): Promise<number[]>;

	/**
	 * Stops the extension hosts.
	 */
	stopExtensionHosts(): void;

	/**
	 * Restarts the extension host.
	 */
	restartExtensionHost(): Promise<void>;

	/**
	 * Starts the extension hosts.
	 */
	startExtensionHosts(): Promise<void>;

	/**
	 * Modify the environment of the remote extension host
	 * @param env New properties for the remote extension host
	 */
	setRemoteEnvironment(env: { [key: string]: string | null }): Promise<void>;

	/**
	 * Please do not use!
	 * (This is public such that the extension host process can coordinate with and call back in the IExtensionService)
	 */
	_activateById(extensionId: ExtensionIdentifier, reason: ExtensionActivationReason): Promise<void>;
}

export interface IInternalExtensionService {
	_activateById(extensionId: ExtensionIdentifier, reason: ExtensionActivationReason): Promise<void>;
	_onWillActivateExtension(extensionId: ExtensionIdentifier): void;
	_onDidActivateExtension(extensionId: ExtensionIdentifier, codeLoadingTime: number, activateCallTime: number, activateResolvedTime: number, activationReason: ExtensionActivationReason): void;
	_onDidActivateExtensionError(extensionId: ExtensionIdentifier, error: Error): void;
	_onExtensionRuntimeError(extensionId: ExtensionIdentifier, err: Error): void;
}

export interface ProfileSession {
	stop(): Promise<IExtensionHostProfile>;
}

export function toExtension(extensionDescription: IExtensionDescription): IExtension {
	return {
		type: extensionDescription.isBuiltin ? ExtensionType.System : ExtensionType.User,
		isBuiltin: extensionDescription.isBuiltin || extensionDescription.isUserBuiltin,
		identifier: { id: getGalleryExtensionId(extensionDescription.publisher, extensionDescription.name), uuid: extensionDescription.uuid },
		manifest: extensionDescription,
		location: extensionDescription.extensionLocation,
		targetPlatform: extensionDescription.targetPlatform,
	};
}

export function toExtensionDescription(extension: IExtension, isUnderDevelopment?: boolean): IExtensionDescription {
	return {
		identifier: new ExtensionIdentifier(getExtensionId(extension.manifest.publisher, extension.manifest.name)),
		isBuiltin: extension.type === ExtensionType.System,
		isUserBuiltin: extension.type === ExtensionType.User && extension.isBuiltin,
		isUnderDevelopment: !!isUnderDevelopment,
		extensionLocation: extension.location,
		...extension.manifest,
		uuid: extension.identifier.uuid,
		targetPlatform: extension.targetPlatform
	};
}


export class NullExtensionService implements IExtensionService {
	declare readonly _serviceBrand: undefined;
	onDidRegisterExtensions: Event<void> = Event.None;
	onDidChangeExtensionsStatus: Event<ExtensionIdentifier[]> = Event.None;
	onDidChangeExtensions: Event<void> = Event.None;
	onWillActivateByEvent: Event<IWillActivateEvent> = Event.None;
	onDidChangeResponsiveChange: Event<IResponsiveStateChangeEvent> = Event.None;
	activateByEvent(_activationEvent: string): Promise<void> { return Promise.resolve(undefined); }
	activationEventIsDone(_activationEvent: string): boolean { return false; }
	whenInstalledExtensionsRegistered(): Promise<boolean> { return Promise.resolve(true); }
	getExtensions(): Promise<IExtensionDescription[]> { return Promise.resolve([]); }
	getExtension() { return Promise.resolve(undefined); }
	readExtensionPointContributions<T>(_extPoint: IExtensionPoint<T>): Promise<ExtensionPointContribution<T>[]> { return Promise.resolve(Object.create(null)); }
	getExtensionsStatus(): { [id: string]: IExtensionsStatus } { return Object.create(null); }
	getInspectPort(_extensionHostId: string, _tryEnableInspector: boolean): Promise<number> { return Promise.resolve(0); }
	getInspectPorts(_extensionHostKind: ExtensionHostKind, _tryEnableInspector: boolean): Promise<number[]> { return Promise.resolve([]); }
	stopExtensionHosts(): void { }
	async restartExtensionHost(): Promise<void> { }
	async startExtensionHosts(): Promise<void> { }
	async setRemoteEnvironment(_env: { [key: string]: string | null }): Promise<void> { }
	canAddExtension(): boolean { return false; }
	canRemoveExtension(): boolean { return false; }
	_activateById(_extensionId: ExtensionIdentifier, _reason: ExtensionActivationReason): Promise<void> { return Promise.resolve(); }
}
