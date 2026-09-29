import { CLASS_NAMES as C } from "./classNames"

type ExploreTopicListProps = { readonly topics: ReadonlyArray<string> }

/** Non-navigational topic tags for the knowledge inventory. */
const ExploreTopicList = ({ topics }: ExploreTopicListProps) => (
    <ul className={C.list}>
        {topics.map((topic) => (
            <li className={C.topic} key={topic}>
                {topic}
            </li>
        ))}
    </ul>
)

export default ExploreTopicList
