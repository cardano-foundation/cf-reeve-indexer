# Changelog

## [1.3.0](https://github.com/cardano-foundation/cf-reeve-indexer/compare/1.2.1...1.3.0) (2026-06-02)


### Features

* added credential tx hash in identity popup ([3502af3](https://github.com/cardano-foundation/cf-reeve-indexer/commit/3502af356d4f1f20b6af63866d23f403b0e1843f))
* order fields on reports ([#65](https://github.com/cardano-foundation/cf-reeve-indexer/issues/65)) ([374253f](https://github.com/cardano-foundation/cf-reeve-indexer/commit/374253fe51c72d22cf36060eb14fe86c7e6eb708))
* order fields on reports ([#66](https://github.com/cardano-foundation/cf-reeve-indexer/issues/66)) ([2c63d72](https://github.com/cardano-foundation/cf-reeve-indexer/commit/2c63d726ae949f7bc6bf67ce6637113c708ee3e7))


### Bug Fixes

* added a workaround to ensure the latest events are present ([cce5521](https://github.com/cardano-foundation/cf-reeve-indexer/commit/cce552102f50d785e075d6d923971a5af3430e96))
* Changed the layout on the landing page. ([a66c170](https://github.com/cardano-foundation/cf-reeve-indexer/commit/a66c1707fc2be676d4fe85f4e10b3bcff197e0c5))
* correct order for imports. ([337d78c](https://github.com/cardano-foundation/cf-reeve-indexer/commit/337d78c18765c3cd8487981920c2cedd57f62575))
* LOB-2132 fixed the dropdown by switching from useEffect to dedicated method that triggers change on user input. Also added image on the landing page. ([2afcb26](https://github.com/cardano-foundation/cf-reeve-indexer/commit/2afcb2689d2091c59ca9eaa5940e36beafbbee1d))

## [1.2.1](https://github.com/cardano-foundation/cf-reeve-indexer/compare/1.2.0...1.2.1) (2026-03-31)


### Bug Fixes

* income_statement fields force order ([#58](https://github.com/cardano-foundation/cf-reeve-indexer/issues/58)) ([a817b3c](https://github.com/cardano-foundation/cf-reeve-indexer/commit/a817b3cefe9b7588d3b44503085d7a89d8e0e12b))
* legacy report rules ([#59](https://github.com/cardano-foundation/cf-reeve-indexer/issues/59)) ([41df37d](https://github.com/cardano-foundation/cf-reeve-indexer/commit/41df37d13581f79147044141ea48b1db3137ee59))

## [1.2.0](https://github.com/cardano-foundation/cf-reeve-indexer/compare/1.1.0...1.2.0) (2026-03-27)


### Features

* [LOB-1956] Dynamic search for transaction numbers ([5792d4b](https://github.com/cardano-foundation/cf-reeve-indexer/commit/5792d4b813b8e302b30abbde04ac653a77cfb849))
* **reports:** proper pagination, show tx hash of first report tx ([#55](https://github.com/cardano-foundation/cf-reeve-indexer/issues/55)) ([70f2b62](https://github.com/cardano-foundation/cf-reeve-indexer/commit/70f2b623a5e18c0efeb1d23729de7413f80ca0be))


### Bug Fixes

* apply spotless formatting ([7fa00db](https://github.com/cardano-foundation/cf-reeve-indexer/commit/7fa00dbc9bbd6d7e761af37ad06962c397167911))
* links to components, do not force redirect to default page ([#57](https://github.com/cardano-foundation/cf-reeve-indexer/issues/57)) ([88e3699](https://github.com/cardano-foundation/cf-reeve-indexer/commit/88e369969c2b1cf6cbc2516f2aee89b049e170de))
* **reports:** ensure unique row id ([2399397](https://github.com/cardano-foundation/cf-reeve-indexer/commit/23993978c66de7588939c3b07cb6c76602350d18))
* translation broken when no id found ([bb69c05](https://github.com/cardano-foundation/cf-reeve-indexer/commit/bb69c050a82506054ba8aa74193295086ccf2df2))

## [1.1.0](https://github.com/cardano-foundation/cf-reeve-indexer/compare/1.0.2...1.1.0) (2026-03-11)


### Features

* matching the preview of the report based on heirarchy struture ([85decd3](https://github.com/cardano-foundation/cf-reeve-indexer/commit/85decd3116b2b3f28f995a0b011a06d720bd43fc))


### Bug Fixes

* metadata deserializer handles unknown types ([#48](https://github.com/cardano-foundation/cf-reeve-indexer/issues/48)) ([d743e5a](https://github.com/cardano-foundation/cf-reeve-indexer/commit/d743e5a9aa4af3a873ddde925a05cdabb7f038a6))

## [1.0.2](https://github.com/cardano-foundation/cf-reeve-indexer/compare/1.0.1...1.0.2) (2026-02-24)


### Bug Fixes

* dashboard api calls, report modal ([#43](https://github.com/cardano-foundation/cf-reeve-indexer/issues/43)) ([0ce7dfe](https://github.com/cardano-foundation/cf-reeve-indexer/commit/0ce7dfe63fc2eb947890b9c2a5fef52a78749fa7))

## [1.0.1](https://github.com/cardano-foundation/cf-reeve-indexer/compare/1.0.0...1.0.1) (2026-02-23)


### Bug Fixes

* added important tag ([d67f7df](https://github.com/cardano-foundation/cf-reeve-indexer/commit/d67f7df76463f6971cc922874176a693fa5577b0))
* fixing sorting for reporting page ([feda42f](https://github.com/cardano-foundation/cf-reeve-indexer/commit/feda42f554823752c701fdc729fc66781b07df12))
* removed pageable to avoid 2000 lines cap ([9ef6477](https://github.com/cardano-foundation/cf-reeve-indexer/commit/9ef6477e712963f889301f673ff984c4b924dc71))

## [1.0.0](https://github.com/cardano-foundation/cf-reeve-indexer/compare/v1.0.0...v1.0.0) (2026-02-12)


### Features

* [LOB-1782] [BE] Add global filters to Tables - Public Interface: enhance request payload ([56dfd0e](https://github.com/cardano-foundation/cf-reeve-indexer/commit/56dfd0e2d2d5e74484493b9910288f9037a5af2c))
* add currency management and update organisation service ([c9af918](https://github.com/cardano-foundation/cf-reeve-indexer/commit/c9af918651785ea4084a03cf84465622e2d05cab))
* add identity and report metadata handling, enhance Keri service integration, and update configuration ([c941992](https://github.com/cardano-foundation/cf-reeve-indexer/commit/c941992d9d4b1e8178d510a46379fec5ca7b99a7))
* add identity and report metadata handling, enhance Keri service integration, and update configuration ([8f59e09](https://github.com/cardano-foundation/cf-reeve-indexer/commit/8f59e09098945ef88018c92dbdb00951aabec7a8))
* add identity verification status component and integrate with report entities ([04701ab](https://github.com/cardano-foundation/cf-reeve-indexer/commit/04701ab1797330997caa0d783bac638011e7f3cc))
* added amounts FCY to the filters ([623f93d](https://github.com/cardano-foundation/cf-reeve-indexer/commit/623f93d834e1d3064797d6d4337a07f359eddbc3))
* added api models/services ([1b0fc5b](https://github.com/cardano-foundation/cf-reeve-indexer/commit/1b0fc5bd6020943d70ff00cc2250344cbe6e59e5))
* added better report mapping ([e17cfc9](https://github.com/cardano-foundation/cf-reeve-indexer/commit/e17cfc9017e7d26cc62cba46234320b213d2313b))
* added filters related files ([b48026d](https://github.com/cardano-foundation/cf-reeve-indexer/commit/b48026dbdcd8868b60e0a9565f11bb8d823cb64e))
* added frontend to docker compose ([ff7eeaf](https://github.com/cardano-foundation/cf-reeve-indexer/commit/ff7eeafef9b3fec6cb8cf2dccb8429edeb6325e8))
* added Metrics API and example services ([004ef0f](https://github.com/cardano-foundation/cf-reeve-indexer/commit/004ef0f45878806b7188745ba5e8c31b8fb4fa31))
* added pagination, cleanup and spotless ([15c0bd0](https://github.com/cardano-foundation/cf-reeve-indexer/commit/15c0bd0b9373a28a858825ab2bc889079255688f))
* added public reports filters ([f0f4996](https://github.com/cardano-foundation/cf-reeve-indexer/commit/f0f49966ed07b43b1dfd402e907e2ce2f7d9f974))
* added reeve docker compose ([d0d4f38](https://github.com/cardano-foundation/cf-reeve-indexer/commit/d0d4f38647ecd2aabd310ebd6b55cc046a3012df))
* added tempo generated frontend (with some small tweaks) + api adjustments ([2cd7a48](https://github.com/cardano-foundation/cf-reeve-indexer/commit/2cd7a481d05de4c2a9fa61a0222e01b0507c46d7))
* added translations ([99ce8c0](https://github.com/cardano-foundation/cf-reeve-indexer/commit/99ce8c07adcf290665939935f7185a992f58c48a))
* added vlei verification ([f89a34c](https://github.com/cardano-foundation/cf-reeve-indexer/commit/f89a34ce4832dd7ff0713176a33b28eddb8756cf))
* adding docker compose to run the backend more easily ([9f8e79d](https://github.com/cardano-foundation/cf-reeve-indexer/commit/9f8e79df1e1a412d54ee3c714e4e3c4ad5f05429))
* adding keri to docker compose and added docs for oobi resolving ([d491f7c](https://github.com/cardano-foundation/cf-reeve-indexer/commit/d491f7c18133472db00febbdef0cc0e372c4b0be))
* adding pagination to organisation endpoints ([25dab94](https://github.com/cardano-foundation/cf-reeve-indexer/commit/25dab949e37d2086330946c2f99af230e9b7587f))
* adjusted frontend to use the reeve api ([5113add](https://github.com/cardano-foundation/cf-reeve-indexer/commit/5113adddb7a8f35f6e221d497a4acd1c6e9716d2))
* adjusted reponse and frontend to show attestations ([9b9ef34](https://github.com/cardano-foundation/cf-reeve-indexer/commit/9b9ef345001b4ee190a5e3791c7530e13d7235d7))
* adjusted visualization ([b96dd91](https://github.com/cardano-foundation/cf-reeve-indexer/commit/b96dd912b28f7ca5974224050da315f28523d47e))
* change of menus and pages ([88a06ec](https://github.com/cardano-foundation/cf-reeve-indexer/commit/88a06ecb884bfcd23a74c83a906b22680d2a21f2))
* connected the dots ([0e77b27](https://github.com/cardano-foundation/cf-reeve-indexer/commit/0e77b27c94b8bab6a6cc5654df93247febdda2c8))
* enhance identity verification process and add new entity mappings for identity events and credentials ([4399a7f](https://github.com/cardano-foundation/cf-reeve-indexer/commit/4399a7fee1dccace30f8542530db3ff6da660219))
* enhance Keri service with optional SignifyClient and enable conditional identity verification ([22694c6](https://github.com/cardano-foundation/cf-reeve-indexer/commit/22694c696c37750203f96b5b980d31d7e5e43c81))
* enhance Keri service with optional SignifyClient and enable conditional identity verification ([2c6989f](https://github.com/cardano-foundation/cf-reeve-indexer/commit/2c6989f458172fa3c86baa0cf13aff7085322fea))
* finishing local demo ([cbb6789](https://github.com/cardano-foundation/cf-reeve-indexer/commit/cbb6789ae9aef06b14f8cbef97e39e2c0c86bdb8))
* implement first version of the demo ([f1c9504](https://github.com/cardano-foundation/cf-reeve-indexer/commit/f1c9504fba2b52c95bbb1477502bdd9392f947c9))
* incorporated filters into public reports view ([27bcde9](https://github.com/cardano-foundation/cf-reeve-indexer/commit/27bcde98b3cd675a62850e583006d018f5ffad34))
* integrate Keri identity verification and add related configurations ([d140978](https://github.com/cardano-foundation/cf-reeve-indexer/commit/d1409789c5d3a66c9ab17c746ceba6e550e4d316))
* normalized backend to fit reeve public pages ([a73dd30](https://github.com/cardano-foundation/cf-reeve-indexer/commit/a73dd30518275344277b763264dced8978990466))
* removed lines ([1ac0f31](https://github.com/cardano-foundation/cf-reeve-indexer/commit/1ac0f3153f187c8e453c734e789d8130b53c710a))


### Bug Fixes

* [LOB-1813] dev Indexer Number Change ([3104a16](https://github.com/cardano-foundation/cf-reeve-indexer/commit/3104a16a44c44730c82e9997dfb442d4916a589c))
* change of icon for verifier using icon lib and adding error state color changes ([a82694f](https://github.com/cardano-foundation/cf-reeve-indexer/commit/a82694f5bce8a18838509b2b7c08e09e6a2d1031))
* change of port number on frontend ([99d5e62](https://github.com/cardano-foundation/cf-reeve-indexer/commit/99d5e62e265ed087e68590ca19e53edf45375442))
* change of port number on frontend ([0ee7e42](https://github.com/cardano-foundation/cf-reeve-indexer/commit/0ee7e424b3c0746394f5888cfa8f3f1aaf20cc40))
* changed the amount fcy and amount lcy fields to be shown in table ([395deb6](https://github.com/cardano-foundation/cf-reeve-indexer/commit/395deb6ce3b05a3e768d2a80e0f2ac63a442e5b6))
* cleaned basic fe setup files ([9474328](https://github.com/cardano-foundation/cf-reeve-indexer/commit/94743284130a454ae66a44614da1e02b61fe7677))
* colors of cf charts ([452444f](https://github.com/cardano-foundation/cf-reeve-indexer/commit/452444f265d0116baeaa305e50965d53a68c3db1))
* **compose:** fix csp for local setup ([7727853](https://github.com/cardano-foundation/cf-reeve-indexer/commit/77278533ffccf40c775e36b52129066ddf3860c3))
* conflict resolution ([bbc025c](https://github.com/cardano-foundation/cf-reeve-indexer/commit/bbc025ce29802caf51c130496c9ff57e4b6504c4))
* corrected file image ([08bf127](https://github.com/cardano-foundation/cf-reeve-indexer/commit/08bf1273daeec1ca3790ee948a5e291275dc78f3))
* corrected files for readniness ([ef0dc23](https://github.com/cardano-foundation/cf-reeve-indexer/commit/ef0dc237081f80f5b44a682d9df4e3165b8d83bb))
* dateFrom and dateTo correction ([#36](https://github.com/cardano-foundation/cf-reeve-indexer/issues/36)) ([ca20e93](https://github.com/cardano-foundation/cf-reeve-indexer/commit/ca20e93f7a44d58d3d1dda16c6bdf6d0f5bd0f23))
* entryDate ([c443606](https://github.com/cardano-foundation/cf-reeve-indexer/commit/c443606398083a8c62680bbf86d1933abc59df7f))
* fixed common issues ([868308e](https://github.com/cardano-foundation/cf-reeve-indexer/commit/868308e6f9a1bde252949a64fa550cdb5a7e627a))
* fixed common transactions table issues ([f28b34f](https://github.com/cardano-foundation/cf-reeve-indexer/commit/f28b34f36e6817f9e0f2abf4286b743fd6825e07))
* fixed currency formatting ([c6000e2](https://github.com/cardano-foundation/cf-reeve-indexer/commit/c6000e2c4fda60962ef03d2cd0be05ef06784453))
* fixed public transactions page crush ([afdaf43](https://github.com/cardano-foundation/cf-reeve-indexer/commit/afdaf43349d6be65e741214db0f955d696f491b6))
* fixed sorting ([38ef581](https://github.com/cardano-foundation/cf-reeve-indexer/commit/38ef581188989f5ccd4f82c2e94bd463fd85ad7a))
* fixing keriservice for now - will come back to this at a later stage ([21c4c38](https://github.com/cardano-foundation/cf-reeve-indexer/commit/21c4c387a378b3dfb5e62895fbca4efd458efc08))
* fixing name parse bug, where the name could be an array as well ([80d95b6](https://github.com/cardano-foundation/cf-reeve-indexer/commit/80d95b60672a4fad00015913e921a677eee29901))
* fixing the mobile org dialog ([e627dbb](https://github.com/cardano-foundation/cf-reeve-indexer/commit/e627dbb7c437caed1a9d34d09d36edb65896d0f6))
* fixing truncating of numbers ([fa36eaa](https://github.com/cardano-foundation/cf-reeve-indexer/commit/fa36eaa1c8aa098f7d607a9e35cc50e5197329cc))
* font weight added for cards ([faad79a](https://github.com/cardano-foundation/cf-reeve-indexer/commit/faad79a4dc1d0ddb4f56fdf377a4b8942099e20c))
* initial copy files ([358daa0](https://github.com/cardano-foundation/cf-reeve-indexer/commit/358daa04837a7d9667f281ff598abc4b9c0e0425))
* live fetching orgs from api and prefilling select box, removed demo files ([ef3ed4a](https://github.com/cardano-foundation/cf-reeve-indexer/commit/ef3ed4aa15aa6438dfd9296f1e24550e01594d0d))
* more files removed from authenticated views and correct reports api ([ced60ee](https://github.com/cardano-foundation/cf-reeve-indexer/commit/ced60eeec1c83d4bc9775050c36d53125069186d))
* name correction ([3727feb](https://github.com/cardano-foundation/cf-reeve-indexer/commit/3727febcdadc41375d7cbae4f3c116ce4eba1f49))
* new organisation added, menus altered, style changes on token page ([8ae7773](https://github.com/cardano-foundation/cf-reeve-indexer/commit/8ae77736829c93c93a1a6ca6f35e890ac9c46f7a))
* organisation component to render options ([3d2bbb4](https://github.com/cardano-foundation/cf-reeve-indexer/commit/3d2bbb4fb27f7d3ce6d54e50b502fbadcfbd2b52))
* removed all private repo dependencies ([1851192](https://github.com/cardano-foundation/cf-reeve-indexer/commit/18511921fbc0629aa6a5752aa68cac16d75aeee7))
* removed enwanted vars ([02a3a31](https://github.com/cardano-foundation/cf-reeve-indexer/commit/02a3a31446a5a90650759c2e393171b9aa1fcd32))
* removed line ([4889aae](https://github.com/cardano-foundation/cf-reeve-indexer/commit/4889aae77df3c01a450786625fcb9478d2158fc4))
* removed overview  image ([2102a75](https://github.com/cardano-foundation/cf-reeve-indexer/commit/2102a75afdb90375aa90dd70c747dc1a6087e52e))
* removed private files and dependencies, altered readme ([5c7a445](https://github.com/cardano-foundation/cf-reeve-indexer/commit/5c7a44558c3df17095366f6d34035a088f15cac8))
* removed unused logo ([38f9969](https://github.com/cardano-foundation/cf-reeve-indexer/commit/38f99699bbb7c0ef99d035bb6f639e6216f075f1))
* removed unwanted files to commit ([ce046ba](https://github.com/cardano-foundation/cf-reeve-indexer/commit/ce046ba715aba4d31f8763d19c23c961cdfba1f1))
* replaced the organisation icon plus dialog with sidebar select menu for data persistence and cleanup unncecessary components ([a752957](https://github.com/cardano-foundation/cf-reeve-indexer/commit/a752957bbc0e617a4387f4e1007adfbebea16911))
* report identity not resolved while running ([21fa1fc](https://github.com/cardano-foundation/cf-reeve-indexer/commit/21fa1fcc485e7108a7bf90feec8ed2967c9646f0))
* resolves the iOS floating-label bug ([1c8a51f](https://github.com/cardano-foundation/cf-reeve-indexer/commit/1c8a51f945aaf7d9575d78a36d69f780d85249dc))
* some changes on configs ([48d60fa](https://github.com/cardano-foundation/cf-reeve-indexer/commit/48d60fa1fdd1632eb6edb82bd131e282a780409c))
* sorting dictionary ([99ac38a](https://github.com/cardano-foundation/cf-reeve-indexer/commit/99ac38a761b45a153835274f19a0f68cc069a1ef))
* styling the select box ([c8987d1](https://github.com/cardano-foundation/cf-reeve-indexer/commit/c8987d1ab2521a73a6504c459916bb52e0ca42c8))
* updated amount labels ([45b0e33](https://github.com/cardano-foundation/cf-reeve-indexer/commit/45b0e3371349ac165f5fd9759b1302378e520e89))


### Miscellaneous Chores

* **worfklow:** track release properly ([0b66e1f](https://github.com/cardano-foundation/cf-reeve-indexer/commit/0b66e1f61c35aad0c75ff25968ad17bf1f68ced3))
