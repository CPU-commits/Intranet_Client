<script setup lang="ts">
// Type
import type { Address } from '~/models/address/address'

type AddressGeo = {
	formatted: string
	components: {
		house_number?: string
		city?: string
		postcode?: string
		country: string
		county?: string
	}
	geometry: {
		lat: number
		lng: number
	}
}
// Props
defineProps({
	// eslint-disable-next-line vue/require-prop-types
	value: {
		required: true,
	},
	id: {
		type: String,
		default: '',
	},
})

// NuxtApp
const { $fetchModule } = useNuxtApp()

const emits = defineEmits<{
	(e: 'update:value', value: any): void
	(e: 'update:address', value: Address): void
}>()

// Search
const isFocus = ref(false)
const isLoading = ref(false)
const timerId = ref<NodeJS.Timeout | null>(null)
const addresses = ref<Array<AddressGeo>>([])

function searchAddress(value: string) {
	emits('update:value', value)
	isLoading.value = true
	addresses.value = []
	if (timerId.value !== null) clearTimeout(timerId.value)

	timerId.value = setTimeout(async () => {
		// Config
		const {
			public: { GEO_KEY },
		} = useRuntimeConfig()
		const data = await $fetchModule.fetchData<{
			results: Array<AddressGeo>
		}>({
			method: 'get',
			URL: `https://api.opencagedata.com/geocode/v1/json?q=${value}&key=${GEO_KEY}&language=es&pretty=1&limit=5&countrycode=cl`,
			scopeSpinner: 'geo-address',
		})
		isLoading.value = false

		addresses.value = data.results
	}, 500)
}

function emitAddress(addressString: string, address: AddressGeo) {
	emits('update:value', addressString)
	emits('update:address', {
		building_site_number: address.components.house_number,
		street_number_name: address.formatted,
		city: address.components.city ?? address.components.county,
		postal_code: address.components.postcode,
		country: address.components.country,
		lat: address.geometry.lat,
		lng: address.geometry.lng,
	})
}

function close() {
	setTimeout(() => (isFocus.value = false), 100)
}
</script>

<template>
	<div class="Address">
		<input
			:id="id"
			:value="value"
			@focus="() => (isFocus = true)"
			@focusout="close"
			@input="($event) => searchAddress(($event.target as HTMLInputElement).value)"
		/>
		<aside
			v-if="(addresses.length > 0 || isLoading) && isFocus"
			class="Adress_addresses"
		>
			<SpinnerGet v-if="isLoading" scope="geo-address" />
			<HTMLButtonText
				v-for="(address, i) in addresses"
				:key="i"
				:click="() => emitAddress(address.formatted, address)"
			>
				<p>{{ address.formatted }}</p>
			</HTMLButtonText>
		</aside>
	</div>
</template>

<style lang="scss" scoped>
.Address {
	position: relative;
}

input {
	width: 100%;
	padding: 10px;
	box-sizing: border-box;
	background-color: transparent;
	border: none;
	border-bottom: 3px var(--color-light) solid;
	transition: all 0.4s ease-in-out;
}

input:focus {
	border-bottom: 3px var(--color-main) solid;
	outline: none;
}

.dark-mode .Adress_addresses {
	background-color: var(--color-main-dark);
}

.light-mode .Adress_addresses {
	box-shadow: var(--box-shadow);
}

.Adress_addresses {
	border: 1px solid var(--color-light);
	border-radius: 5px;
	position: absolute;
	width: 100%;
}

.Color {
	padding: 0;
}

// Media queries
@media (max-width: 767.98px) {
	input {
		padding: 8px;
		font-size: 0.8rem;
	}
}

@media (max-width: 575.98px) {
	input {
		padding: 7px;
		font-size: 0.75rem;
		border-bottom: 1px var(--color-light) solid;
	}

	input:focus {
		border-bottom: 1.5px var(--color-main) solid;
		outline: none;
	}
}
</style>
