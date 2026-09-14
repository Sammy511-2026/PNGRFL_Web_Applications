import { getProducts } from '../api/resources'
import { useApi } from '../hooks/useApi'
import RequestState from '../Components/ui/RequestState'

export default function Shop() {
    const { data: products, isLoading, error, reload } = useApi(getProducts, [])

    return (
        <div className="page">
            <h1>PNG RFL Shop</h1>
            <p>Official team merchandise and supporter gear.</p>

            <RequestState isLoading={isLoading} error={error} onRetry={reload} />

            <div className="content-grid">
                {products.map(product => (
                    <article className="content-panel" key={product.id}>
                        <h2>{product.name}</h2>
                        <p>{product.price}</p>
                        <button type="button" disabled>{product.status === 'coming-soon' ? 'Coming soon' : 'View product'}</button>
                    </article>
                ))}
            </div>
        </div>
    )
}
