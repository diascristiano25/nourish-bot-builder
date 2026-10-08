import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import * as PhosphorIcons from '@phosphor-icons/react';
import { featureTabs } from '@/data/landingContent';
import { useState } from 'react';

export function FeatureTabsSection(): JSX.Element {
  const [activeTab, setActiveTab] = useState(featureTabs[0].id);
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});

  const handleImageLoad = (tabId: string) => {
    setImageLoaded(prev => ({ ...prev, [tabId]: true }));
  };

  return (
    <section id="features" className="py-16 md:py-24 px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-12">
          Recursos Completos para sua Prática
        </h2>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-center mb-12">
            <TabsList className="inline-flex">
              {featureTabs.map(tab => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {featureTabs.map(tab => (
            <TabsContent
              key={tab.id}
              value={tab.id}
              className="transition-opacity duration-300"
            >
              <div className="grid lg:grid-cols-2 gap-12 items-start">
                {/* Left: Screenshot */}
                <div className="order-2 lg:order-1">
                  {!imageLoaded[tab.id] ? (
                    <div className="w-full aspect-[4/3] rounded-lg bg-slate-200 animate-pulse" />
                  ) : null}
                  <img
                    src={tab.screenshot}
                    alt={`Interface de ${tab.label} do NutriFlow`}
                    className={`rounded-lg border border-slate-200 shadow-lg w-full transition-opacity duration-300 ${
                      imageLoaded[tab.id] ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => handleImageLoad(tab.id)}
                    loading="lazy"
                  />
                </div>

                {/* Right: Features */}
                <div className="order-1 lg:order-2 space-y-6">
                  {tab.features.map((feature, idx) => {
                    const IconComponent = (PhosphorIcons as any)[feature.icon];
                    return (
                      <div key={idx} className="flex gap-4">
                        <div className="flex-shrink-0">
                          {IconComponent && (
                            <IconComponent
                              size={24}
                              weight="duotone"
                              className="text-emerald-500"
                            />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-1">
                            {feature.title}
                          </h3>
                          <p className="text-slate-600 leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
