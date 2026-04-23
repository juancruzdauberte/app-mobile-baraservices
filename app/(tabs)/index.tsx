import { useCallback, useRef } from "react";
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGlobalTabBarScroll } from "../../hooks/useGlobalTabBarScroll";

export default function Home() {
  const scrollProps = useGlobalTabBarScroll();

  return (
    <SafeAreaView className="bg-blue-300">
      <ScrollView {...scrollProps}>
        <View>
          <Text className="text-red-400">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto
            laudantium alias, atque accusamus excepturi similique esse deserunt
            ipsa aspernatur corrupti nisi exercitationem veritatis temporibus
            eligendi ut possimus, corporis adipisci nesciunt!
          </Text>
          <Text className="text-red-400">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto
            laudantium alias, atque accusamus excepturi similique esse deserunt
            ipsa aspernatur corrupti nisi exercitationem veritatis temporibus
            eligendi ut possimus, corporis adipisci nesciunt!
          </Text>
          <Text className="text-red-400">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto
            laudantium alias, atque accusamus excepturi similique esse deserunt
            ipsa aspernatur corrupti nisi exercitationem veritatis temporibus
            eligendi ut possimus, corporis adipisci nesciunt!
          </Text>
          <Text className="text-red-400">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto
            laudantium alias, atque accusamus excepturi similique esse deserunt
            ipsa aspernatur corrupti nisi exercitationem veritatis temporibus
            eligendi ut possimus, corporis adipisci nesciunt!
          </Text>
          <Text className="text-red-400">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto
            laudantium alias, atque accusamus excepturi similique esse deserunt
            ipsa aspernatur corrupti nisi exercitationem veritatis temporibus
            eligendi ut possimus, corporis adipisci nesciunt!
          </Text>
          <Text className="text-red-400">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto
            laudantium alias, atque accusamus excepturi similique esse deserunt
            ipsa aspernatur corrupti nisi exercitationem veritatis temporibus
            eligendi ut possimus, corporis adipisci nesciunt!
          </Text>
          <Text className="text-red-400">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto
            laudantium alias, atque accusamus excepturi similique esse deserunt
            ipsa aspernatur corrupti nisi exercitationem veritatis temporibus
            eligendi ut possimus, corporis adipisci nesciunt!
          </Text>
          <Text className="text-red-400">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto
            laudantium alias, atque accusamus excepturi similique esse deserunt
            ipsa aspernatur corrupti nisi exercitationem veritatis temporibus
            eligendi ut possimus, corporis adipisci nesciunt! Lorem ipsum dolor
            sit amet consectetur adipisicing elit. Voluptatum nulla perferendis
            quidem ipsum enim soluta fugiat sed ut et odio rerum officiis quo
            rem, adipisci mollitia earum, eum, facere incidunt. Architecto nihil
            iusto magni possimus. Blanditiis, facilis quia nulla ex inventore
            laboriosam atque adipisci, corrupti molestias autem eveniet enim
            quasi tenetur, quis voluptates. Dolores provident illum odit quasi
            nihil. Deleniti! Architecto reiciendis aliquid illo veritatis ipsum,
            aspernatur nostrum doloribus, culpa magnam, et quidem obcaecati id
            blanditiis! Dolorum velit accusamus repellat perspiciatis quasi
            vero, earum vel facilis. Obcaecati consequuntur odit nobis?
            Accusamus adipisci perspiciatis optio ut illo velit molestiae qui,
            rerum nostrum cum non doloremque nulla beatae esse perferendis
            officia! Veritatis consequatur tempore exercitationem incidunt,
            asperiores dolore blanditiis alias error et? Lorem ipsum dolor sit
            amet, consectetur adipisicing elit. Consequuntur, quo accusamus.
            Ullam asperiores dolorum ratione distinctio voluptate quasi
            officiis, nihil assumenda illo quae quisquam non, debitis, sequi
            sapiente officia. Modi? Officia dolore distinctio vitae odit, esse
            nemo qui mollitia a dolorem nam excepturi adipisci fuga ex possimus,
            totam temporibus asperiores commodi. Odit aliquid omnis molestias
            commodi id, dolores quia sit. Perspiciatis sint a saepe labore
            adipisci at quasi vel ex quo eum? Iste quis quae sed nostrum
            necessitatibus deserunt iure voluptatum ex? Autem repellat unde
            expedita ad dolores quis sapiente! Doloremque mollitia consectetur
            perspiciatis ipsam adipisci praesentium iure quas ullam iusto
            officia inventore, voluptates ipsa omnis voluptatem tempora,
            deleniti rem. Ex, minima consequuntur! Illo excepturi cum error
            veniam illum quo? Dolorem sit, illum, placeat voluptates recusandae
            numquam consequatur id deleniti aut excepturi pariatur. Praesentium
            placeat necessitatibus ipsam, excepturi cumque harum, nostrum qui
            facilis saepe at quam similique quae vero eos! Temporibus doloribus
            dolorem non a esse aspernatur possimus explicabo fugit magni, nisi
            aliquid inventore atque, vel debitis, dolores earum rerum
            repudiandae. Vel consequatur deleniti non ipsa odio sapiente
            repudiandae perferendis? Quas minus tenetur exercitationem officiis
            vero tempora quasi voluptates nulla excepturi libero, temporibus id
            obcaecati blanditiis aliquam, velit, quidem culpa! Iste voluptatibus
            quia quas ullam dolores minima blanditiis illo ipsa! Veritatis
            voluptates dolores necessitatibus minus doloremque tempora iure sit
            provident, voluptatibus distinctio modi cupiditate sapiente
            accusantium, porro sequi, quod mollitia iste voluptate dolorum nulla
            eaque! Harum quae odit in quo.
          </Text>
          <Text className="text-red-400">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto
            laudantium alias, atque accusamus excepturi similique esse deserunt
            ipsa aspernatur corrupti nisi exercitationem veritatis temporibus
            eligendi ut possimus, corporis adipisci nesciunt! Lorem ipsum dolor
            sit amet consectetur adipisicing elit. Voluptatum nulla perferendis
            quidem ipsum enim soluta fugiat sed ut et odio rerum officiis quo
            rem, adipisci mollitia earum, eum, facere incidunt. Architecto nihil
            iusto magni possimus. Blanditiis, facilis quia nulla ex inventore
            laboriosam atque adipisci, corrupti molestias autem eveniet enim
            quasi tenetur, quis voluptates. Dolores provident illum odit quasi
            nihil. Deleniti! Architecto reiciendis aliquid illo veritatis ipsum,
            aspernatur nostrum doloribus, culpa magnam, et quidem obcaecati id
            blanditiis! Dolorum velit accusamus repellat perspiciatis quasi
            vero, earum vel facilis. Obcaecati consequuntur odit nobis?
            Accusamus adipisci perspiciatis optio ut illo velit molestiae qui,
            rerum nostrum cum non doloremque nulla beatae esse perferendis
            officia! Veritatis consequatur tempore exercitationem incidunt,
            asperiores dolore blanditiis alias error et? Lorem ipsum dolor sit
            amet, consectetur adipisicing elit. Consequuntur, quo accusamus.
            Ullam asperiores dolorum ratione distinctio voluptate quasi
            officiis, nihil assumenda illo quae quisquam non, debitis, sequi
            sapiente officia. Modi? Officia dolore distinctio vitae odit, esse
            nemo qui mollitia a dolorem nam excepturi adipisci fuga ex possimus,
            totam temporibus asperiores commodi. Odit aliquid omnis molestias
            commodi id, dolores quia sit. Perspiciatis sint a saepe labore
            adipisci at quasi vel ex quo eum? Iste quis quae sed nostrum
            necessitatibus deserunt iure voluptatum ex? Autem repellat unde
            expedita ad dolores quis sapiente! Doloremque mollitia consectetur
            perspiciatis ipsam adipisci praesentium iure quas ullam iusto
            officia inventore, voluptates ipsa omnis voluptatem tempora,
            deleniti rem. Ex, minima consequuntur! Illo excepturi cum error
            veniam illum quo? Dolorem sit, illum, placeat voluptates recusandae
            numquam consequatur id deleniti aut excepturi pariatur. Praesentium
            placeat necessitatibus ipsam, excepturi cumque harum, nostrum qui
            facilis saepe at quam similique quae vero eos! Temporibus doloribus
            dolorem non a esse aspernatur possimus explicabo fugit magni, nisi
            aliquid inventore atque, vel debitis, dolores earum rerum
            repudiandae. Vel consequatur deleniti non ipsa odio sapiente
            repudiandae perferendis? Quas minus tenetur exercitationem officiis
            vero tempora quasi voluptates nulla excepturi libero, temporibus id
            obcaecati blanditiis aliquam, velit, quidem culpa! Iste voluptatibus
            quia quas ullam dolores minima blanditiis illo ipsa! Veritatis
            voluptates dolores necessitatibus minus doloremque tempora iure sit
            provident, voluptatibus distinctio modi cupiditate sapiente
            accusantium, porro sequi, quod mollitia iste voluptate dolorum nulla
            eaque! Harum quae odit in quo.
          </Text>
          <Text className="text-red-400">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto
            laudantium alias, atque accusamus excepturi similique esse deserunt
            ipsa aspernatur corrupti nisi exercitationem veritatis temporibus
            eligendi ut possimus, corporis adipisci nesciunt! Lorem ipsum dolor
            sit amet consectetur adipisicing elit. Voluptatum nulla perferendis
            quidem ipsum enim soluta fugiat sed ut et odio rerum officiis quo
            rem, adipisci mollitia earum, eum, facere incidunt. Architecto nihil
            iusto magni possimus. Blanditiis, facilis quia nulla ex inventore
            laboriosam atque adipisci, corrupti molestias autem eveniet enim
            quasi tenetur, quis voluptates. Dolores provident illum odit quasi
            nihil. Deleniti! Architecto reiciendis aliquid illo veritatis ipsum,
            aspernatur nostrum doloribus, culpa magnam, et quidem obcaecati id
            blanditiis! Dolorum velit accusamus repellat perspiciatis quasi
            vero, earum vel facilis. Obcaecati consequuntur odit nobis?
            Accusamus adipisci perspiciatis optio ut illo velit molestiae qui,
            rerum nostrum cum non doloremque nulla beatae esse perferendis
            officia! Veritatis consequatur tempore exercitationem incidunt,
            asperiores dolore blanditiis alias error et? Lorem ipsum dolor sit
            amet, consectetur adipisicing elit. Consequuntur, quo accusamus.
            Ullam asperiores dolorum ratione distinctio voluptate quasi
            officiis, nihil assumenda illo quae quisquam non, debitis, sequi
            sapiente officia. Modi? Officia dolore distinctio vitae odit, esse
            nemo qui mollitia a dolorem nam excepturi adipisci fuga ex possimus,
            totam temporibus asperiores commodi. Odit aliquid omnis molestias
            commodi id, dolores quia sit. Perspiciatis sint a saepe labore
            adipisci at quasi vel ex quo eum? Iste quis quae sed nostrum
            necessitatibus deserunt iure voluptatum ex? Autem repellat unde
            expedita ad dolores quis sapiente! Doloremque mollitia consectetur
            perspiciatis ipsam adipisci praesentium iure quas ullam iusto
            officia inventore, voluptates ipsa omnis voluptatem tempora,
            deleniti rem. Ex, minima consequuntur! Illo excepturi cum error
            veniam illum quo? Dolorem sit, illum, placeat voluptates recusandae
            numquam consequatur id deleniti aut excepturi pariatur. Praesentium
            placeat necessitatibus ipsam, excepturi cumque harum, nostrum qui
            facilis saepe at quam similique quae vero eos! Temporibus doloribus
            dolorem non a esse aspernatur possimus explicabo fugit magni, nisi
            aliquid inventore atque, vel debitis, dolores earum rerum
            repudiandae. Vel consequatur deleniti non ipsa odio sapiente
            repudiandae perferendis? Quas minus tenetur exercitationem officiis
            vero tempora quasi voluptates nulla excepturi libero, temporibus id
            obcaecati blanditiis aliquam, velit, quidem culpa! Iste voluptatibus
            quia quas ullam dolores minima blanditiis illo ipsa! Veritatis
            voluptates dolores necessitatibus minus doloremque tempora iure sit
            provident, voluptatibus distinctio modi cupiditate sapiente
            accusantium, porro sequi, quod mollitia iste voluptate dolorum nulla
            eaque! Harum quae odit in quo.
          </Text>
          <Text className="text-red-400">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto
            laudantium alias, atque accusamus excepturi similique esse deserunt
            ipsa aspernatur corrupti nisi exercitationem veritatis temporibus
            eligendi ut possimus, corporis adipisci nesciunt! Lorem ipsum dolor
            sit amet consectetur adipisicing elit. Voluptatum nulla perferendis
            quidem ipsum enim soluta fugiat sed ut et odio rerum officiis quo
            rem, adipisci mollitia earum, eum, facere incidunt. Architecto nihil
            iusto magni possimus. Blanditiis, facilis quia nulla ex inventore
            laboriosam atque adipisci, corrupti molestias autem eveniet enim
            quasi tenetur, quis voluptates. Dolores provident illum odit quasi
            nihil. Deleniti! Architecto reiciendis aliquid illo veritatis ipsum,
            aspernatur nostrum doloribus, culpa magnam, et quidem obcaecati id
            blanditiis! Dolorum velit accusamus repellat perspiciatis quasi
            vero, earum vel facilis. Obcaecati consequuntur odit nobis?
            Accusamus adipisci perspiciatis optio ut illo velit molestiae qui,
            rerum nostrum cum non doloremque nulla beatae esse perferendis
            officia! Veritatis consequatur tempore exercitationem incidunt,
            asperiores dolore blanditiis alias error et? Lorem ipsum dolor sit
            amet, consectetur adipisicing elit. Consequuntur, quo accusamus.
            Ullam asperiores dolorum ratione distinctio voluptate quasi
            officiis, nihil assumenda illo quae quisquam non, debitis, sequi
            sapiente officia. Modi? Officia dolore distinctio vitae odit, esse
            nemo qui mollitia a dolorem nam excepturi adipisci fuga ex possimus,
            totam temporibus asperiores commodi. Odit aliquid omnis molestias
            commodi id, dolores quia sit. Perspiciatis sint a saepe labore
            adipisci at quasi vel ex quo eum? Iste quis quae sed nostrum
            necessitatibus deserunt iure voluptatum ex? Autem repellat unde
            expedita ad dolores quis sapiente! Doloremque mollitia consectetur
            perspiciatis ipsam adipisci praesentium iure quas ullam iusto
            officia inventore, voluptates ipsa omnis voluptatem tempora,
            deleniti rem. Ex, minima consequuntur! Illo excepturi cum error
            veniam illum quo? Dolorem sit, illum, placeat voluptates recusandae
            numquam consequatur id deleniti aut excepturi pariatur. Praesentium
            placeat necessitatibus ipsam, excepturi cumque harum, nostrum qui
            facilis saepe at quam similique quae vero eos! Temporibus doloribus
            dolorem non a esse aspernatur possimus explicabo fugit magni, nisi
            aliquid inventore atque, vel debitis, dolores earum rerum
            repudiandae. Vel consequatur deleniti non ipsa odio sapiente
            repudiandae perferendis? Quas minus tenetur exercitationem officiis
            vero tempora quasi voluptates nulla excepturi libero, temporibus id
            obcaecati blanditiis aliquam, velit, quidem culpa! Iste voluptatibus
            quia quas ullam dolores minima blanditiis illo ipsa! Veritatis
            voluptates dolores necessitatibus minus doloremque tempora iure sit
            provident, voluptatibus distinctio modi cupiditate sapiente
            accusantium, porro sequi, quod mollitia iste voluptate dolorum nulla
            eaque! Harum quae odit in quo.
          </Text>
          <Text className="text-red-400">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto
            laudantium alias, atque accusamus excepturi similique esse deserunt
            ipsa aspernatur corrupti nisi exercitationem veritatis temporibus
            eligendi ut possimus, corporis adipisci nesciunt! Lorem ipsum dolor
            sit amet consectetur adipisicing elit. Voluptatum nulla perferendis
            quidem ipsum enim soluta fugiat sed ut et odio rerum officiis quo
            rem, adipisci mollitia earum, eum, facere incidunt. Architecto nihil
            iusto magni possimus. Blanditiis, facilis quia nulla ex inventore
            laboriosam atque adipisci, corrupti molestias autem eveniet enim
            quasi tenetur, quis voluptates. Dolores provident illum odit quasi
            nihil. Deleniti! Architecto reiciendis aliquid illo veritatis ipsum,
            aspernatur nostrum doloribus, culpa magnam, et quidem obcaecati id
            blanditiis! Dolorum velit accusamus repellat perspiciatis quasi
            vero, earum vel facilis. Obcaecati consequuntur odit nobis?
            Accusamus adipisci perspiciatis optio ut illo velit molestiae qui,
            rerum nostrum cum non doloremque nulla beatae esse perferendis
            officia! Veritatis consequatur tempore exercitationem incidunt,
            asperiores dolore blanditiis alias error et? Lorem ipsum dolor sit
            amet, consectetur adipisicing elit. Consequuntur, quo accusamus.
            Ullam asperiores dolorum ratione distinctio voluptate quasi
            officiis, nihil assumenda illo quae quisquam non, debitis, sequi
            sapiente officia. Modi? Officia dolore distinctio vitae odit, esse
            nemo qui mollitia a dolorem nam excepturi adipisci fuga ex possimus,
            totam temporibus asperiores commodi. Odit aliquid omnis molestias
            commodi id, dolores quia sit. Perspiciatis sint a saepe labore
            adipisci at quasi vel ex quo eum? Iste quis quae sed nostrum
            necessitatibus deserunt iure voluptatum ex? Autem repellat unde
            expedita ad dolores quis sapiente! Doloremque mollitia consectetur
            perspiciatis ipsam adipisci praesentium iure quas ullam iusto
            officia inventore, voluptates ipsa omnis voluptatem tempora,
            deleniti rem. Ex, minima consequuntur! Illo excepturi cum error
            veniam illum quo? Dolorem sit, illum, placeat voluptates recusandae
            numquam consequatur id deleniti aut excepturi pariatur. Praesentium
            placeat necessitatibus ipsam, excepturi cumque harum, nostrum qui
            facilis saepe at quam similique quae vero eos! Temporibus doloribus
            dolorem non a esse aspernatur possimus explicabo fugit magni, nisi
            aliquid inventore atque, vel debitis, dolores earum rerum
            repudiandae. Vel consequatur deleniti non ipsa odio sapiente
            repudiandae perferendis? Quas minus tenetur exercitationem officiis
            vero tempora quasi voluptates nulla excepturi libero, temporibus id
            obcaecati blanditiis aliquam, velit, quidem culpa! Iste voluptatibus
            quia quas ullam dolores minima blanditiis illo ipsa! Veritatis
            voluptates dolores necessitatibus minus doloremque tempora iure sit
            provident, voluptatibus distinctio modi cupiditate sapiente
            accusantium, porro sequi, quod mollitia iste voluptate dolorum nulla
            eaque! Harum quae odit in quo.
          </Text>
          <Text className="text-red-400">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto
            laudantium alias, atque accusamus excepturi similique esse deserunt
            ipsa aspernatur corrupti nisi exercitationem veritatis temporibus
            eligendi ut possimus, corporis adipisci nesciunt! Lorem ipsum dolor
            sit amet consectetur adipisicing elit. Voluptatum nulla perferendis
            quidem ipsum enim soluta fugiat sed ut et odio rerum officiis quo
            rem, adipisci mollitia earum, eum, facere incidunt. Architecto nihil
            iusto magni possimus. Blanditiis, facilis quia nulla ex inventore
            laboriosam atque adipisci, corrupti molestias autem eveniet enim
            quasi tenetur, quis voluptates. Dolores provident illum odit quasi
            nihil. Deleniti! Architecto reiciendis aliquid illo veritatis ipsum,
            aspernatur nostrum doloribus, culpa magnam, et quidem obcaecati id
            blanditiis! Dolorum velit accusamus repellat perspiciatis quasi
            vero, earum vel facilis. Obcaecati consequuntur odit nobis?
            Accusamus adipisci perspiciatis optio ut illo velit molestiae qui,
            rerum nostrum cum non doloremque nulla beatae esse perferendis
            officia! Veritatis consequatur tempore exercitationem incidunt,
            asperiores dolore blanditiis alias error et? Lorem ipsum dolor sit
            amet, consectetur adipisicing elit. Consequuntur, quo accusamus.
            Ullam asperiores dolorum ratione distinctio voluptate quasi
            officiis, nihil assumenda illo quae quisquam non, debitis, sequi
            sapiente officia. Modi? Officia dolore distinctio vitae odit, esse
            nemo qui mollitia a dolorem nam excepturi adipisci fuga ex possimus,
            totam temporibus asperiores commodi. Odit aliquid omnis molestias
            commodi id, dolores quia sit. Perspiciatis sint a saepe labore
            adipisci at quasi vel ex quo eum? Iste quis quae sed nostrum
            necessitatibus deserunt iure voluptatum ex? Autem repellat unde
            expedita ad dolores quis sapiente! Doloremque mollitia consectetur
            perspiciatis ipsam adipisci praesentium iure quas ullam iusto
            officia inventore, voluptates ipsa omnis voluptatem tempora,
            deleniti rem. Ex, minima consequuntur! Illo excepturi cum error
            veniam illum quo? Dolorem sit, illum, placeat voluptates recusandae
            numquam consequatur id deleniti aut excepturi pariatur. Praesentium
            placeat necessitatibus ipsam, excepturi cumque harum, nostrum qui
            facilis saepe at quam similique quae vero eos! Temporibus doloribus
            dolorem non a esse aspernatur possimus explicabo fugit magni, nisi
            aliquid inventore atque, vel debitis, dolores earum rerum
            repudiandae. Vel consequatur deleniti non ipsa odio sapiente
            repudiandae perferendis? Quas minus tenetur exercitationem officiis
            vero tempora quasi voluptates nulla excepturi libero, temporibus id
            obcaecati blanditiis aliquam, velit, quidem culpa! Iste voluptatibus
            quia quas ullam dolores minima blanditiis illo ipsa! Veritatis
            voluptates dolores necessitatibus minus doloremque tempora iure sit
            provident, voluptatibus distinctio modi cupiditate sapiente
            accusantium, porro sequi, quod mollitia iste voluptate dolorum nulla
            eaque! Harum quae odit in quo.
          </Text>
          <Text className="text-red-400">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto
            laudantium alias, atque accusamus excepturi similique esse deserunt
            ipsa aspernatur corrupti nisi exercitationem veritatis temporibus
            eligendi ut possimus, corporis adipisci nesciunt! Lorem ipsum dolor
            sit amet consectetur adipisicing elit. Voluptatum nulla perferendis
            quidem ipsum enim soluta fugiat sed ut et odio rerum officiis quo
            rem, adipisci mollitia earum, eum, facere incidunt. Architecto nihil
            iusto magni possimus. Blanditiis, facilis quia nulla ex inventore
            laboriosam atque adipisci, corrupti molestias autem eveniet enim
            quasi tenetur, quis voluptates. Dolores provident illum odit quasi
            nihil. Deleniti! Architecto reiciendis aliquid illo veritatis ipsum,
            aspernatur nostrum doloribus, culpa magnam, et quidem obcaecati id
            blanditiis! Dolorum velit accusamus repellat perspiciatis quasi
            vero, earum vel facilis. Obcaecati consequuntur odit nobis?
            Accusamus adipisci perspiciatis optio ut illo velit molestiae qui,
            rerum nostrum cum non doloremque nulla beatae esse perferendis
            officia! Veritatis consequatur tempore exercitationem incidunt,
            asperiores dolore blanditiis alias error et? Lorem ipsum dolor sit
            amet, consectetur adipisicing elit. Consequuntur, quo accusamus.
            Ullam asperiores dolorum ratione distinctio voluptate quasi
            officiis, nihil assumenda illo quae quisquam non, debitis, sequi
            sapiente officia. Modi? Officia dolore distinctio vitae odit, esse
            nemo qui mollitia a dolorem nam excepturi adipisci fuga ex possimus,
            totam temporibus asperiores commodi. Odit aliquid omnis molestias
            commodi id, dolores quia sit. Perspiciatis sint a saepe labore
            adipisci at quasi vel ex quo eum? Iste quis quae sed nostrum
            necessitatibus deserunt iure voluptatum ex? Autem repellat unde
            expedita ad dolores quis sapiente! Doloremque mollitia consectetur
            perspiciatis ipsam adipisci praesentium iure quas ullam iusto
            officia inventore, voluptates ipsa omnis voluptatem tempora,
            deleniti rem. Ex, minima consequuntur! Illo excepturi cum error
            veniam illum quo? Dolorem sit, illum, placeat voluptates recusandae
            numquam consequatur id deleniti aut excepturi pariatur. Praesentium
            placeat necessitatibus ipsam, excepturi cumque harum, nostrum qui
            facilis saepe at quam similique quae vero eos! Temporibus doloribus
            dolorem non a esse aspernatur possimus explicabo fugit magni, nisi
            aliquid inventore atque, vel debitis, dolores earum rerum
            repudiandae. Vel consequatur deleniti non ipsa odio sapiente
            repudiandae perferendis? Quas minus tenetur exercitationem officiis
            vero tempora quasi voluptates nulla excepturi libero, temporibus id
            obcaecati blanditiis aliquam, velit, quidem culpa! Iste voluptatibus
            quia quas ullam dolores minima blanditiis illo ipsa! Veritatis
            voluptates dolores necessitatibus minus doloremque tempora iure sit
            provident, voluptatibus distinctio modi cupiditate sapiente
            accusantium, porro sequi, quod mollitia iste voluptate dolorum nulla
            eaque! Harum quae odit in quo.
          </Text>
          <Text className="text-red-400">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto
            laudantium alias, atque accusamus excepturi similique esse deserunt
            ipsa aspernatur corrupti nisi exercitationem veritatis temporibus
            eligendi ut possimus, corporis adipisci nesciunt! Lorem ipsum dolor
            sit amet consectetur adipisicing elit. Voluptatum nulla perferendis
            quidem ipsum enim soluta fugiat sed ut et odio rerum officiis quo
            rem, adipisci mollitia earum, eum, facere incidunt. Architecto nihil
            iusto magni possimus. Blanditiis, facilis quia nulla ex inventore
            laboriosam atque adipisci, corrupti molestias autem eveniet enim
            quasi tenetur, quis voluptates. Dolores provident illum odit quasi
            nihil. Deleniti! Architecto reiciendis aliquid illo veritatis ipsum,
            aspernatur nostrum doloribus, culpa magnam, et quidem obcaecati id
            blanditiis! Dolorum velit accusamus repellat perspiciatis quasi
            vero, earum vel facilis. Obcaecati consequuntur odit nobis?
            Accusamus adipisci perspiciatis optio ut illo velit molestiae qui,
            rerum nostrum cum non doloremque nulla beatae esse perferendis
            officia! Veritatis consequatur tempore exercitationem incidunt,
            asperiores dolore blanditiis alias error et? Lorem ipsum dolor sit
            amet, consectetur adipisicing elit. Consequuntur, quo accusamus.
            Ullam asperiores dolorum ratione distinctio voluptate quasi
            officiis, nihil assumenda illo quae quisquam non, debitis, sequi
            sapiente officia. Modi? Officia dolore distinctio vitae odit, esse
            nemo qui mollitia a dolorem nam excepturi adipisci fuga ex possimus,
            totam temporibus asperiores commodi. Odit aliquid omnis molestias
            commodi id, dolores quia sit. Perspiciatis sint a saepe labore
            adipisci at quasi vel ex quo eum? Iste quis quae sed nostrum
            necessitatibus deserunt iure voluptatum ex? Autem repellat unde
            expedita ad dolores quis sapiente! Doloremque mollitia consectetur
            perspiciatis ipsam adipisci praesentium iure quas ullam iusto
            officia inventore, voluptates ipsa omnis voluptatem tempora,
            deleniti rem. Ex, minima consequuntur! Illo excepturi cum error
            veniam illum quo? Dolorem sit, illum, placeat voluptates recusandae
            numquam consequatur id deleniti aut excepturi pariatur. Praesentium
            placeat necessitatibus ipsam, excepturi cumque harum, nostrum qui
            facilis saepe at quam similique quae vero eos! Temporibus doloribus
            dolorem non a esse aspernatur possimus explicabo fugit magni, nisi
            aliquid inventore atque, vel debitis, dolores earum rerum
            repudiandae. Vel consequatur deleniti non ipsa odio sapiente
            repudiandae perferendis? Quas minus tenetur exercitationem officiis
            vero tempora quasi voluptates nulla excepturi libero, temporibus id
            obcaecati blanditiis aliquam, velit, quidem culpa! Iste voluptatibus
            quia quas ullam dolores minima blanditiis illo ipsa! Veritatis
            voluptates dolores necessitatibus minus doloremque tempora iure sit
            provident, voluptatibus distinctio modi cupiditate sapiente
            accusantium, porro sequi, quod mollitia iste voluptate dolorum nulla
            eaque! Harum quae odit in quo.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
