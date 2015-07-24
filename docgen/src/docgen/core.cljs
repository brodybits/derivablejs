(ns docgen.core
  (:require [cljs.reader :refer [read-string]]
            [cljs.pprint :refer [pprint]]
            [docgen.ast :as ast]
            [docgen.names :refer [get-namespace resolve]]
            [docgen.typescript :refer [->typescript]]))

(enable-console-print!)

(js/require "source-map-support/register")

(def fs (js/require "fs"))
(defn slurp [f]
  (.toString (.readFileSync fs f)))
(defn spit [f s]
  (.writeFileSync fs f s))

(defn make-d-ts [in-file module]
  (str
"/**
 * This TypeScript file was generated from " in-file ".
 * Please change that file and re-run `grunt docs` to modify this file.
 */
"
  (->typescript module)
  "\n"))

(defn -main [in-file out-file]
  (let [module (->> in-file
                 slurp
                 read-string
                 ast/parse-module)
        namespace (get-namespace module)]
    (pprint (resolve namespace ["havelock" "Reaction"] "Atom"))
    (spit out-file (make-d-ts in-file module))))

(set! *main-cli-fn* -main)
